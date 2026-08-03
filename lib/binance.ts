import crypto from 'crypto';

const BINANCE_BASE_URL = 'https://api.binance.com';

function getBinanceCredentials() {
  return {
    apiKey: process.env.BINANCE_API_KEY || '',
    apiSecret: process.env.BINANCE_API_SECRET || '',
  };
}

function createSignature(queryString: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

/**
 * Fetches free USDT balance from Binance SPOT wallet
 */
export async function getBinanceAccountBalance(): Promise<{ success: boolean; usdtBalance?: number; error?: string }> {
  const { apiKey, apiSecret } = getBinanceCredentials();
  if (!apiKey || !apiSecret) {
    return { success: false, error: 'Binance API Key or Secret missing in environment variables' };
  }

  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(queryString, apiSecret);

    const url = `${BINANCE_BASE_URL}/api/v3/account?${queryString}&signature=${signature}`;

    const res = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      cache: 'no-store',
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

/**
 * Automates USDT payment/withdrawal directly from Binance account
 */
export async function withdrawUsdtFromBinance(
  amount: number,
  address: string = '835340307'
): Promise<{ success: boolean; txId?: string; error?: string }> {
  const { apiKey, apiSecret } = getBinanceCredentials();
  if (!apiKey || !apiSecret) {
    return { success: false, error: 'Binance API credentials missing in environment variables.' };
  }

  // Check Binance USDT balance first
  const balanceCheck = await getBinanceAccountBalance();
  if (!balanceCheck.success) {
    return { success: false, error: `Binance Balance Check Failed: ${balanceCheck.error}` };
  }

  const currentUsdt = balanceCheck.usdtBalance || 0;
  if (currentUsdt < amount) {
    return {
      success: false,
      error: `Binance SPOT balance insufficient. Available: $${currentUsdt.toFixed(2)} USDT (Required: $${amount.toFixed(2)} USDT). Please add USDT to your Binance Spot Account.`,
    };
  }

  try {
    const timestamp = Date.now();
    const params = new URLSearchParams({
      coin: 'USDT',
      address: address,
      amount: amount.toString(),
      timestamp: timestamp.toString(),
    });

    const signature = createSignature(params.toString(), apiSecret);
    params.append('signature', signature);

    const url = `${BINANCE_BASE_URL}/sapi/v1/capital/withdraw/apply`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok || data.code) {
      return {
        success: false,
        error: data.msg || `Binance auto-payment rejected. Ensure 'Enable Withdrawals' is enabled on your Binance API Key settings.`,
      };
    }

    return {
      success: true,
      txId: data.id || data.tranId,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to process Binance auto-payment' };
  }
}
