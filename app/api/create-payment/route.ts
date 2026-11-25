import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { usesDatabaseCatalog } from '@/app/lib/catalog/source';

import { CheckoutError, reserveOrder, startOrderPayment } from '@/app/lib/payments/orders';
import { paymentConfig } from '@/app/lib/payments/provider';

export async function POST(req: NextRequest) {
  if (usesDatabaseCatalog()) {
    let orderId: string | undefined;
    try {
      const config = paymentConfig();
      if (!config) return NextResponse.json({ error: 'Оплата сейчас недоступна.' }, { status: 503 });
      const body = await req.json();
      if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Проверь заказ.' }, { status: 400 });

      const order = await reserveOrder(body);
      orderId = order.id;
      const confirmationUrl = await startOrderPayment(order, config);
      return NextResponse.json({ confirmationUrl });
    } catch (error) {
      if (error instanceof CheckoutError || error instanceof SyntaxError) {
        return NextResponse.json(error instanceof CheckoutError
          ? { error: error.message, restart: error.restart }
          : { error: 'Проверь заказ.' }, { status: 409 });
      }
      console.error('Не удалось создать платёж:', error instanceof Error ? error.message : 'неизвестная ошибка');
      return NextResponse.json({
        error: orderId
          ? `Не удалось получить ссылку на оплату. Повтори попытку в этой вкладке. Номер заказа: ${orderId}`
          : 'Не удалось оформить заказ. Попробуй ещё раз.',
      }, { status: 503 });
    }
  }

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
      description: `Доставка ${metadata?.delivery || 'СДЭК'}`,
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
