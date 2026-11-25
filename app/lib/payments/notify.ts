import 'server-only';

import { Resend } from 'resend';
import { getPrisma } from '@/app/lib/prisma';
import type { Order, OrderItem } from '@/app/generated/prisma/client';
import { rubles } from './provider';

export async function notifyPaidOrder(order: Order & { items: OrderItem[] }) {
  if (order.status !== 'PAID' || order.notifiedAt) return;
  if (!process.env.RESEND_API_KEY) return;

  const customer = order.customer as Record<string, string>;
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: 'Маана <orders@maana.ru>',
    to: process.env.ORDERS_EMAIL || 'juliya.ist0508@gmail.com',
    subject: 'Новый оплаченный заказ МААНА',
    text: [
      `Заказ: ${order.id}`,
      `Платёж: ${order.paymentId}`,
      `Сумма: ${rubles(order.amountKopecks)} RUB`,
      `Доставка: ${customer.delivery}, ${customer.city}, ${customer.pickupAddress}`,
      `ФИО: ${customer.fio}`, `Телефон: ${customer.phone}`, `Email: ${customer.email}`,
      `Комментарий: ${customer.comment}`,
      ...order.items.map((item) => `${item.name} — ${item.quantity} шт × ${rubles(item.priceKopecks)} руб`),
    ].join('\n'),
  }, { idempotencyKey: `maana-order-paid/${order.id}` });
  if (error) throw new Error('Resend не принял уведомление о заказе.');

  await getPrisma().order.updateMany({
    where: { id: order.id, notifiedAt: null },
    data: { notifiedAt: new Date() },
  });
}
