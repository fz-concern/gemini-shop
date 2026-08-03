import crypto from 'crypto';

const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;
const BINANCE_BASE_URL = 'https://api.binance.com';

function createSignature(queryString: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

export async function getBinanceAccountBalance(): Promise<{ success: boolean; usdtBalance?: number; error?: string }> {
  if (!BINANCE_API_KEY || !BINANCE_API_SECRET) {
    return { success: false, error: 'Binance API Key or Secret missing' };
  }

  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(queryString, BINANCE_API_SECRET);

    const url = `${BINANCE_BASE_URL}/api/v3/account?${queryString}&signature=${signature}`;

    const res = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': BINANCE_API_KEY,
      },
      next: { revalidate: 0 },
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.msg || 'Failed to fetch Binance account balance' };
    }

    const balances = data.balances || [];
    const usdtAsset = balances.find((b: any) => b.asset === 'USDT');
    const freeUsdt = usdtAsset ? parseFloat(usdtAsset.free) : 0;

    return {
      success: true,
      usdtBalance: freeUsdt,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error connecting to Binance' };
  }
}
