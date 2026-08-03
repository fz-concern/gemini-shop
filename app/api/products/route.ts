import { NextResponse } from 'next/server';
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
  } catch {
    // fallback to local JSON
  }
  return readLocalJson<Record<string, number>>('product_pricing.json', {});
}

export async function GET() {
  try {
    const res = await fetch(`${BOT_BASE_URL}/products`, {
      headers: {
        'X-API-Key': API_KEY,
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `TeleShopBot API error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    let rawProducts: Product[] = data.data || [];

    const customPricing = await getProductPricing();

    const mergedProducts = rawProducts.map((p) => {
      const basePrice = p.price;
      const customPrice = customPricing[p.id];
      const finalPrice = customPrice !== undefined ? customPrice : basePrice;

      return {
        ...p,
        basePrice,
        price: finalPrice,
        profitMargin: finalPrice - basePrice,
      };
    });

    return NextResponse.json({
      success: true,
      data: mergedProducts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
