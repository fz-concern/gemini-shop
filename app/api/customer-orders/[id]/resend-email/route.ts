import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, readLocalJson, writeLocalJson } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { CustomerOrder } from '@/lib/types';
import { sendActivationEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { id } = await params;
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
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (targetOrder.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Only approved orders with activation links can receive an email' },
        { status: 400 }
      );
    }

    // Send email
    const emailResult = await sendActivationEmail(targetOrder);

    targetOrder.emailSent = emailResult.success;
    targetOrder.emailSentAt = emailResult.success ? new Date().toISOString() : targetOrder.emailSentAt;
    targetOrder.emailError = emailResult.success ? undefined : emailResult.error;
    targetOrder.updatedAt = new Date().toISOString();

    if (db) {
      const collection = db.collection<CustomerOrder>('customer_orders');
      await collection.updateOne(
        { id },
        {
          $set: {
            emailSent: targetOrder.emailSent,
            emailSentAt: targetOrder.emailSentAt,
            emailError: targetOrder.emailError,
            updatedAt: targetOrder.updatedAt,
          },
        }
      );
    } else {
      const idx = allOrders.findIndex((o) => o.id === id);
      if (idx !== -1) allOrders[idx] = targetOrder;
      writeLocalJson('customer_orders.json', allOrders);
    }

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error || 'Failed to send activation email.',
        data: targetOrder,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Activation email sent successfully to ${targetOrder.emailAddress || targetOrder.contactValue}!`,
      data: targetOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
