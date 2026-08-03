import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://teleshopbot.com/api/gemini-18months-links-shop/bots/6a0f0aaae2a8b6c3616d1a8b/v1';
const DEFAULT_KEY = process.env.TELESHOPBOT_API_KEY || '';

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-custom-api-key') || DEFAULT_KEY;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const res = await fetch(`${API_BASE}/orders?page=${page}&limit=${limit}`, {
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-custom-api-key') || DEFAULT_KEY;
    const body = await req.json();

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
