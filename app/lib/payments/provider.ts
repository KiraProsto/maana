import 'server-only';

export interface Payment {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  metadata?: Record<string, string>;
  confirmation?: { confirmation_url?: string };
}

export const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function paymentConfig() {
  const { YOKASSA_SHOP_ID, YOKASSA_SECRET_KEY, SITE_URL } = process.env;
  if (!YOKASSA_SHOP_ID || !YOKASSA_SECRET_KEY || !SITE_URL) return null;
  let url: URL;
  try { url = new URL(SITE_URL); } catch { return null; }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) return null;
  return { url, authorization: 'Basic ' + Buffer.from(`${YOKASSA_SHOP_ID}:${YOKASSA_SECRET_KEY}`).toString('base64') };
}

export async function yookassa(path: string, authorization: string, init?: RequestInit) {
  return fetch('https://api.yookassa.ru/v3/payments' + path, {
    ...init,
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
    headers: { ...init?.headers, Authorization: authorization },
  });
}

export function rubles(kopecks: number) {
  return (kopecks / 100).toFixed(2);
}
