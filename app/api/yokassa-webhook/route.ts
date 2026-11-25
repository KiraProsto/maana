import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

import { settleOrder } from '@/app/lib/payments/orders';
import { uuidPattern, yookassa } from '@/app/lib/payments/provider';
import type { Payment } from '@/app/lib/payments/provider';
import { notifyPaidOrder } from '@/app/lib/payments/notify';
const inventoryPath = path.join(process.cwd(), 'data', 'inventory.json');

async function decrementInventory(items: { id?: number; count: number }[]) {
  try {
    const raw = await fs.readFile(inventoryPath, 'utf-8');
    const inventory: Record<string, number> = JSON.parse(raw);

    for (const item of items) {
      if (!item.id) continue;
      const key = String(item.id);
      if (inventory[key] !== undefined) {
        inventory[key] = Math.max(0, inventory[key] - item.count);
      }
    }

    await fs.writeFile(
      inventoryPath,
      JSON.stringify(inventory, null, 2),
      'utf-8',
    );
  } catch (err) {
    console.error('Ошибка обновления инвентаря:', err);
  }
}

export async function POST(req: NextRequest) {
  const event = await req.json().catch(() => null);
  if (event?.event !== 'payment.succeeded' && event?.event !== 'payment.canceled') {
    return NextResponse.json({ ok: true });
  }

  const id = event.object?.id;
  if (typeof id !== 'string' || !uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Некорректный ID платежа' }, { status: 400 });
  }

  const { YOKASSA_SHOP_ID, YOKASSA_SECRET_KEY } = process.env;
  if (!YOKASSA_SHOP_ID || !YOKASSA_SECRET_KEY) {
    return NextResponse.json({ error: 'ЮKassa не настроена' }, { status: 503 });
  }

  let payment: Payment;
  try {
    const authorization = 'Basic ' + Buffer.from(`${YOKASSA_SHOP_ID}:${YOKASSA_SECRET_KEY}`).toString('base64');
    const response = await yookassa('/' + id, authorization);
    if (!response.ok) return NextResponse.json({ error: 'Статус платежа недоступен' }, { status: 503 });
    payment = await response.json();
    if (payment.id !== id || !payment.amount) {
      return NextResponse.json({ error: 'Ответ ЮKassa не соответствует запросу' }, { status: 503 });
    }
    if (payment.metadata?.orderId) {
      if (payment.status !== 'succeeded' && payment.status !== 'canceled') {
        return NextResponse.json({ error: 'Платёж ещё не завершён' }, { status: 503 });
      }
      const order = await settleOrder(payment);
      if (!order) return NextResponse.json({ error: 'Платёж не сопоставлен с заказом' }, { status: 503 });
      await notifyPaidOrder(order);
      return NextResponse.json({ ok: true });
    }
  } catch {
    return NextResponse.json({ error: 'Не удалось обработать платёж' }, { status: 503 });
  }

  if (event.event === 'payment.succeeded' && payment.status === 'succeeded') {
    const meta = payment.metadata || {};

    let items: { id?: number; name: string; count: number; price: number }[] =
      [];
    try {
      items = JSON.parse(meta.items || '[]');
    } catch {
      items = [];
    }

    await decrementInventory(items);

    const itemsHtml = items
      .map(
        (item) =>
          `<li>${item.name} — ${item.count} шт × ${item.price} руб = ${item.count * item.price} руб</li>`,
      )
      .join('');

    const html = `
      <h2>Новый оплаченный заказ</h2>
      <p><b>Сумма:</b> ${payment.amount.value} ${payment.amount.currency}</p>
      <p><b>ФИО:</b> ${meta.fio || '-'}</p>
      <p><b>Телефон:</b> ${meta.phone || '-'}</p>
      <p><b>Email:</b> ${meta.email || '-'}</p>
      <p><b>Город:</b> ${meta.city || '-'}</p>
      <p><b>Адрес пункта выдачи:</b> ${meta.pickupAddress || '-'}</p>
      <p><b>Способ доставки:</b> ${meta.delivery || '-'}</p>
      <p><b>Комментарий:</b> ${meta.comment || '-'}</p>
      <p><b>Товары:</b></p>
      <ul>${itemsHtml}</ul>
      <p><b>ID платежа:</b> ${payment.id}</p>
    `;

    try {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: 'Маана <orders@maana.ru>',
        to: 'juliya.ist0508@gmail.com',
        subject: `Новый заказ от ${meta.fio || 'клиента'}`,
        html,
      });
    } catch (err) {
      console.error('Ошибка отправки письма:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
