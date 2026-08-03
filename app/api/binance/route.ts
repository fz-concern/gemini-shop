import { NextRequest, NextResponse } from 'next/server';
import { getBinanceAccountBalance } from '@/lib/binance';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const result = await getBinanceAccountBalance();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, usdtBalance: result.usdtBalance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
