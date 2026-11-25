import { NextRequest, NextResponse } from 'next/server';
import { getCdekQuote } from '@/app/lib/payments/cdek';

export async function POST(req: NextRequest) {
  const { city, weight = 1000 } = await req.json();
  if (typeof city !== 'string' || !city.trim() || city.length > 150 ||
      !Number.isSafeInteger(weight) || weight < 1 || weight > 30_000) {
    return NextResponse.json({ error: 'Проверь город и вес заказа' }, { status: 400 });
  }

  try {
    return NextResponse.json(await getCdekQuote(city.trim(), weight));
  } catch {
    return NextResponse.json({ error: 'Не удалось рассчитать доставку' }, { status: 400 });
  }
}
