import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanHtmlText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<tg-emoji[^>]*>(.*?)<\/tg-emoji>/gi, '$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .trim();
}

// 1 USD = 280 PKR default exchange rate
export const DEFAULT_PKR_RATE = 280;

export function formatCurrency(amountUSD: number, pkrRate: number = DEFAULT_PKR_RATE): string {
  if (amountUSD === undefined || amountUSD === null) return '$0.00 (Rs. 0)';

  const usdStr = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountUSD);

  const pkrAmount = Math.round(amountUSD * pkrRate);
  const pkrStr = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(pkrAmount).replace('PKR', 'Rs.');

  return `${usdStr} (${pkrStr})`;
}

export function formatUSDOnly(amountUSD: number): string {
  if (amountUSD === undefined || amountUSD === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amountUSD);
}

export function formatPKROnly(amountUSD: number, pkrRate: number = DEFAULT_PKR_RATE): string {
  const pkrAmount = Math.round(amountUSD * pkrRate);
  return `Rs. ${pkrAmount.toLocaleString('en-PK')}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
