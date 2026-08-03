import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, readLocalJson, writeLocalJson } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    if (db) {
      const collection = db.collection('product_pricing');
      const docs = await collection.find({}).toArray();
      const pricing: Record<string, number> = {};
      docs.forEach((doc) => {
        pricing[doc.productId] = doc.customPrice;
      });
      return NextResponse.json({ success: true, data: pricing });
    }

    const localData = readLocalJson<Record<string, number>>('product_pricing.json', {});
    return NextResponse.json({ success: true, data: localData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, customPrice } = body;

    if (!productId || customPrice === undefined || customPrice < 0) {
      return NextResponse.json({ success: false, error: 'Invalid productId or customPrice' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    if (db) {
      const collection = db.collection('product_pricing');
      await collection.updateOne(
        { productId },
        { $set: { productId, customPrice: Number(customPrice), updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    } else {
      const localData = readLocalJson<Record<string, number>>('product_pricing.json', {});
      localData[productId] = Number(customPrice);
      writeLocalJson('product_pricing.json', localData);
    }

    return NextResponse.json({
      success: true,
      message: 'Product custom price updated successfully',
      data: { productId, customPrice },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
