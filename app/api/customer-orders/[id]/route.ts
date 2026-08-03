import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, readLocalJson, writeLocalJson } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { CustomerOrder } from '@/lib/types';
import { sendActivationEmail } from '@/lib/email';
import { withdrawUsdtFromBinance } from '@/lib/binance';

const BOT_BASE_URL = 'https://teleshopbot.com/api/gemini-18months-links-shop/bots/6a0f0aaae2a8b6c3616d1a8b/v1';
const API_KEY = process.env.TELESHOPBOT_API_KEY || '';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, rejectionReason, customLink } = body;

    const { db } = await connectToDatabase();

    let targetOrder: CustomerOrder | null = null;
    let allOrders: CustomerOrder[] = [];

    if (db) {
      const collection = db.collection<CustomerOrder>('customer_orders');
      targetOrder = await collection.findOne({ id });
    } else {
      allOrders = readLocalJson<CustomerOrder[]>('customer_orders.json', []);
      targetOrder = allOrders.find((o) => o.id === id) || null;
    }

    if (!targetOrder) {
      return NextResponse.json({ success: false, error: 'Customer order not found' }, { status: 404 });
    }

    // REJECT ORDER
    if (action === 'reject') {
      targetOrder.status = 'rejected';
      targetOrder.rejectionReason = rejectionReason || 'Payment receipt verification failed.';
      targetOrder.updatedAt = new Date().toISOString();

      if (db) {
        const collection = db.collection<CustomerOrder>('customer_orders');
        await collection.updateOne(
          { id },
          { $set: { status: 'rejected', rejectionReason: targetOrder.rejectionReason, updatedAt: targetOrder.updatedAt } }
        );
      } else {
        const idx = allOrders.findIndex((o) => o.id === id);
        if (idx !== -1) allOrders[idx] = targetOrder;
        writeLocalJson('customer_orders.json', allOrders);
      }

      return NextResponse.json({ success: true, message: 'Order rejected', data: targetOrder });
    }

    // APPROVE ORDER (Can approve pending OR previously rejected orders!)
    if (action === 'approve') {
      if (customLink && customLink.trim()) {
        targetOrder.status = 'approved';
        targetOrder.rejectionReason = undefined;
        targetOrder.items = [customLink.trim()];
        targetOrder.approvedAt = new Date().toISOString();
        targetOrder.updatedAt = new Date().toISOString();
      } else {
        let botResponse = await fetch(`${BOT_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
          },
          body: JSON.stringify({
            productId: targetOrder.productId,
            quantity: targetOrder.quantity,
          }),
        });

        let botData = await botResponse.json();

        // If TeleShopBot balance is low, trigger automatic Binance USDT payment!
        if (!botResponse.ok || !botData.success) {
          const errorMsg = (botData.message || botData.error || '').toLowerCase();
          if (errorMsg.includes('balance') || errorMsg.includes('insufficient')) {
            console.log('[Auto-Payment] TeleShopBot balance low. Attempting automatic Binance USDT transfer...');
            const binancePayment = await withdrawUsdtFromBinance(1.0 * targetOrder.quantity, '835340307');

            if (!binancePayment.success) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Approval Failed (TeleShopBot Balance Low). Binance Auto-Payment Error: ${binancePayment.error}. You can also click 'Approve with Custom Link' to manually paste the link.`,
                },
                { status: 400 }
              );
            }

            // Retry bot order after short delay
            await new Promise((resolve) => setTimeout(resolve, 2000));
            botResponse = await fetch(`${BOT_BASE_URL}/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
              },
              body: JSON.stringify({
                productId: targetOrder.productId,
                quantity: targetOrder.quantity,
              }),
            });
            botData = await botResponse.json();
          }
        }

        if (!botResponse.ok || !botData.success) {
          return NextResponse.json(
            {
              success: false,
              error: botData.message || botData.error || 'Failed to place automated order on TeleShopBot API',
            },
            { status: botResponse.status || 500 }
          );
        }

        const botOrder = botData.data;

        targetOrder.status = 'approved';
        targetOrder.rejectionReason = undefined; // Clear any previous rejection reason
        targetOrder.botOrderId = botOrder.id;
        targetOrder.items = botOrder.items || [];
        targetOrder.botOrderDetails = botOrder;
        targetOrder.approvedAt = new Date().toISOString();
        targetOrder.updatedAt = new Date().toISOString();
      }

      // Trigger activation email delivery to user's email address
      const emailResult = await sendActivationEmail(targetOrder);
      if (emailResult.success) {
        targetOrder.emailSent = true;
        targetOrder.emailSentAt = new Date().toISOString();
        targetOrder.emailError = undefined;
      } else {
        targetOrder.emailSent = false;
        targetOrder.emailError = emailResult.error;
      }

      if (db) {
        const collection = db.collection<CustomerOrder>('customer_orders');
        await collection.updateOne(
          { id },
          {
            $set: {
              status: 'approved',
              rejectionReason: undefined,
              botOrderId: targetOrder.botOrderId,
              items: targetOrder.items,
              botOrderDetails: targetOrder.botOrderDetails,
              approvedAt: targetOrder.approvedAt,
              emailSent: targetOrder.emailSent,
              emailSentAt: targetOrder.emailSentAt,
              emailError: targetOrder.emailError,
              updatedAt: targetOrder.updatedAt,
            },
            $unset: { rejectionReason: '' },
          }
        );
      } else {
        const idx = allOrders.findIndex((o) => o.id === id);
        if (idx !== -1) allOrders[idx] = targetOrder;
        writeLocalJson('customer_orders.json', allOrders);
      }

      return NextResponse.json({
        success: true,
        message: targetOrder.emailSent
          ? 'Order approved and activation email sent to customer successfully!'
          : 'Order approved and activation link generated! (Note: Email delivery pending SMTP config)',
        emailSent: targetOrder.emailSent,
        emailError: targetOrder.emailError,
        data: targetOrder,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
