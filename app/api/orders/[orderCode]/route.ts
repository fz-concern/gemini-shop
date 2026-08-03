import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://teleshopbot.com/api/gemini-18months-links-shop/bots/6a0f0aaae2a8b6c3616d1a8b/v1';
const DEFAULT_KEY = process.env.TELESHOPBOT_API_KEY || '';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  try {
    const { orderCode } = await params;
    const apiKey = req.headers.get('x-custom-api-key') || DEFAULT_KEY;

    const res = await fetch(`${API_BASE}/orders/${orderCode}`, {
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
      { success: false, error: error?.message || 'Failed to fetch order detail' },
      { status: 500 }
    );
  }
}
