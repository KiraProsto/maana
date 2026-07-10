import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, description, returnUrl, metadata } = body;

  let items: { name: string; count: number; price: number }[] = [];
  try {
    items = JSON.parse(metadata?.items || '[]');
  } catch {
    items = [];
  }

  const credentials = Buffer.from(
    `${process.env.YOKASSA_SHOP_ID}:${process.env.YOKASSA_SECRET_KEY}`,
  ).toString('base64');

  const deliveryCost = Number(metadata?.deliveryCost || '0');

  const receiptItems = items.map((item) => ({
    description: item.name,
    quantity: String(item.count),
    amount: {
      value: (item.price * item.count).toFixed(2),
      currency: 'RUB',
    },
    vat_code: 1,
  }));

  if (deliveryCost > 0) {
    receiptItems.push({
      description: 'Доставка СДЭК',
      quantity: '1',
      amount: {
        value: deliveryCost.toFixed(2),
        currency: 'RUB',
      },
      vat_code: 1,
    });
  }

  const receipt = {
    customer: {
      email: metadata?.email || '',
      phone: metadata?.phone || '',
    },
    items: receiptItems,
  };

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': uuidv4(),
    },
    body: JSON.stringify({
      amount: {
        value: amount,
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      capture: true,
      description,
      metadata,
      receipt,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }

  return NextResponse.json({
    confirmationUrl: data.confirmation.confirmation_url,
    paymentId: data.id,
  });
}
