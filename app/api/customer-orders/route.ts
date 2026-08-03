import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, readLocalJson, writeLocalJson } from '@/lib/db';
import { uploadScreenshotToCloudinary } from '@/lib/cloudinary';
import { CustomerOrder } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    const { db } = await connectToDatabase();

    let orders: CustomerOrder[] = [];

    if (db) {
      const collection = db.collection<CustomerOrder>('customer_orders');
      let queryObj = {};
      if (search) {
        queryObj = {
          $or: [
            { orderCode: { $regex: search, $options: 'i' } },
            { whatsappNumber: { $regex: search, $options: 'i' } },
            { emailAddress: { $regex: search, $options: 'i' } },
            { id: { $regex: search, $options: 'i' } },
          ],
        };
      }
      orders = await collection.find(queryObj).sort({ createdAt: -1 }).toArray();
    } else {
      orders = readLocalJson<CustomerOrder[]>('customer_orders.json', []);
      if (search) {
        orders = orders.filter(
          (o) =>
            o.orderCode.toLowerCase().includes(search) ||
            (o.whatsappNumber && o.whatsappNumber.toLowerCase().includes(search)) ||
            (o.emailAddress && o.emailAddress.toLowerCase().includes(search)) ||
            o.id.toLowerCase().includes(search)
        );
      }
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, quantity, totalAmount, whatsappNumber, emailAddress, paymentScreenshot } = body;

    if (!productId || !productName || !quantity || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields (productId, productName, quantity, totalAmount)' },
        { status: 400 }
      );
    }

    if (!whatsappNumber && !emailAddress) {
      return NextResponse.json(
        { success: false, error: 'At least one contact detail (whatsappNumber or emailAddress) is required' },
        { status: 400 }
      );
    }

    if (!paymentScreenshot) {
      return NextResponse.json(
        { success: false, error: 'Payment screenshot receipt is required' },
        { status: 400 }
      );
    }

    // 1. Upload screenshot to Cloudinary
    const cloudinaryUrl = await uploadScreenshotToCloudinary(paymentScreenshot);

    const now = new Date();
    const orderCode = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderId = 'cust_ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newOrder: CustomerOrder = {
      id: orderId,
      orderCode,
      productId,
      productName,
      quantity: Number(quantity),
      totalAmount: Number(totalAmount),
      whatsappNumber: whatsappNumber || undefined,
      emailAddress: emailAddress || undefined,
      contactValue: whatsappNumber || emailAddress || '',
      paymentScreenshot: cloudinaryUrl,
      status: 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const { db } = await connectToDatabase();

    if (db) {
      const collection = db.collection<CustomerOrder>('customer_orders');
      await collection.insertOne(newOrder);
    } else {
      const orders = readLocalJson<CustomerOrder[]>('customer_orders.json', []);
      orders.unshift(newOrder);
      writeLocalJson('customer_orders.json', orders);
    }

    return NextResponse.json({
      success: true,
      message: 'Order & payment receipt submitted successfully!',
      data: newOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
