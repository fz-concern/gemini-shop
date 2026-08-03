import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/types';
import { connectToDatabase, readLocalJson } from '@/lib/db';

const BOT_BASE_URL = 'https://teleshopbot.com/api/gemini-18months-links-shop/bots/6a0f0aaae2a8b6c3616d1a8b/v1';
const API_KEY = process.env.TELESHOPBOT_API_KEY || '';

async function getProductPricing(): Promise<Record<string, number>> {
  try {
    const { db } = await connectToDatabase();
    if (db) {
      const collection = db.collection('product_pricing');
      const docs = await collection.find({}).toArray();
      const pricing: Record<string, number> = {};
      docs.forEach((doc) => {
        pricing[doc.productId] = doc.customPrice;
      });
      return pricing;
    }
  } catch {}
  return readLocalJson<Record<string, number>>('product_pricing.json', {});
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${BOT_BASE_URL}/products/${id}`, {
      headers: {
        'X-API-Key': API_KEY,
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Product not found or API error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    let product: Product = data.data;

    const customPricing = await getProductPricing();
    const basePrice = product.price;
    const customPrice = customPricing[product.id];
    const finalPrice = customPrice !== undefined ? customPrice : basePrice;

    const mergedProduct = {
      ...product,
      basePrice,
      price: finalPrice,
      profitMargin: finalPrice - basePrice,
    };

    return NextResponse.json({
      success: true,
      data: mergedProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
