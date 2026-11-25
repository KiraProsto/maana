import 'server-only';

import { createHash } from 'node:crypto';
import { getPrisma } from '@/app/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import { getCdekQuote } from './cdek';
import { estimateWeight, marketplaceCost } from './delivery';
import { rubles, uuidPattern, yookassa } from './provider';
import type { Payment } from './provider';

export class CheckoutError extends Error {
  constructor(message: string, readonly restart = false) {
    super(message);
  }
}

interface Customer {
  fio: string;
  phone: string;
  email: string;
  city: string;
  pickupAddress: string;
  delivery: 'WB' | 'OZON' | 'СДЭК';
  comment: string;
}

export async function reserveOrder(body: Record<string, unknown>) {
  const id = body.checkoutId;
  if (typeof id !== 'string' || !uuidPattern.test(id) || !Array.isArray(body.items) ||
      !body.items.length || body.items.length > 30) {
    throw new CheckoutError('Проверь товары в корзине.');
  }
  const ids = new Map<number, number>();
  for (const item of body.items) {
    if (!item || !Number.isInteger(item.id) || item.id < 1 || item.id > 2_147_483_647 ||
        !Number.isInteger(item.count) || item.count < 1 || item.count > 100 || ids.has(item.id)) {
      throw new CheckoutError('Проверь количество товаров.');
    }
    ids.set(item.id, item.count);
  }
  const quantity = [...ids.values()].reduce((sum, count) => sum + count, 0);
  if (quantity > 100) throw new CheckoutError('В одном заказе может быть до 100 единиц товара.');
  const input = body.metadata as Record<string, unknown> | undefined;
  function field(key: string, limit: number, optional = false) {
    const value = typeof input?.[key] === 'string' ? input[key].trim() : '';
    if ((!optional && !value) || value.length > limit) throw new CheckoutError('Проверь контактные данные и адрес доставки.');
    return value;
  }
  const delivery = field('delivery', 10);
  if (delivery !== 'WB' && delivery !== 'OZON' && delivery !== 'СДЭК') {
    throw new CheckoutError('Выбери способ доставки.');
  }
  const customer: Customer = {
    fio: field('fio', 150), phone: field('phone', 40).replace(/\D/g, ''),
    email: field('email', 254), city: field('city', 150),
    pickupAddress: field('pickupAddress', 300), delivery, comment: field('comment', 500, true),
  };
  if (!/^\d{7,15}$/.test(customer.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    throw new CheckoutError('Проверь телефон и email.');
  }

  const lines = [...ids].sort(([a], [b]) => a - b);
  const requestHash = createHash('sha256').update(JSON.stringify({ lines, customer, amount: body.amount })).digest('hex');
  const prisma = getPrisma();
  const include = { items: { orderBy: { productId: 'asc' as const } } };
  function existingOrder<T extends { requestHash: string; status: string }>(order: T) {
    if (order.requestHash !== requestHash || order.status === 'CANCELLED') {
      throw new CheckoutError('Обнови страницу и начни оформление заново.', order.status === 'CANCELLED');
    }
    return order;
  }

  const existing = await prisma.order.findUnique({ where: { id }, include });
  if (existing) return existingOrder(existing);
  const weight = estimateWeight(quantity);
  let shipping: number;
  try {
    shipping = delivery === 'СДЭК' ? (await getCdekQuote(customer.city, weight)).cost : marketplaceCost(delivery, weight);
  } catch {
    throw new CheckoutError('Не удалось рассчитать доставку. Проверь город и повтори попытку.');
  }
  const deliveryKopecks = shipping * 100;
  if (!Number.isSafeInteger(deliveryKopecks) || deliveryKopecks <= 0) {
    throw new CheckoutError('Стоимость доставки недоступна.');
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1::int AS locked FROM pg_advisory_xact_lock(hashtextextended(${id}::text, 0))`;
    const existing = await tx.order.findUnique({ where: { id }, include });
    if (existing) return existingOrder(existing);

    let amountKopecks = deliveryKopecks;
    const items = [];
    for (const [productId, count] of lines) {
      const [product] = await tx.product.updateManyAndReturn({
        where: { id: productId, status: 'PUBLISHED', deletionToken: null, stock: { gte: count } },
        data: { stock: { decrement: count } },
        select: { name: true, priceKopecks: true },
      });
      if (!product) throw new CheckoutError('Одного из товаров уже нет в нужном количестве.');
      amountKopecks += product.priceKopecks * count;
      items.push({ productId, quantity: count, ...product });
    }

    if (amountKopecks > 2_147_483_647 || body.amount !== rubles(amountKopecks)) {
      throw new CheckoutError('Цена товаров или доставки изменилась. Обнови страницу и проверь сумму.');
    }

    return tx.order.create({
      data: { id, requestHash, amountKopecks, deliveryKopecks, customer: { ...customer }, items: { create: items } },
      include,
    });
  });
}

export async function startOrderPayment(order: Awaited<ReturnType<typeof reserveOrder>>, config: { url: URL; authorization: string }) {
  const returnUrl = new URL('/payment-success', config.url);
  returnUrl.searchParams.set('order', order.id);
  if (order.status === 'PAID') return returnUrl.href;
  if (order.confirmationUrl) return order.confirmationUrl;
  if (Date.now() - order.createdAt.getTime() >= 23 * 60 * 60 * 1000) {
    throw new CheckoutError('Платёж требует проверки. Свяжись с магазином и сообщи номер заказа.');
  }

  const customer = order.customer as unknown as Customer;
  const response = await yookassa('', config.authorization, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotence-Key': order.id },
    body: JSON.stringify({
      amount: { value: rubles(order.amountKopecks), currency: 'RUB' },
      capture: true,
      description: `Заказ МААНА ${order.id}`,
      confirmation: { type: 'redirect', return_url: returnUrl.href },
      metadata: { orderId: order.id },
      receipt: {
        customer: { email: customer.email, phone: customer.phone },
        items: [
          ...order.items.map((item) => ({
            description: item.name.slice(0, 128), quantity: String(item.quantity),
            amount: { value: rubles(item.priceKopecks), currency: 'RUB' }, vat_code: 1,
          })),
          {
            description: `Доставка ${customer.delivery}`, quantity: '1',
            amount: { value: rubles(order.deliveryKopecks), currency: 'RUB' }, vat_code: 1,
          },
        ],
      },
    }),
  });
  if (!response.ok) {
    const failure = await response.json().catch(() => null);
    if (response.status === 400 && failure?.type === 'error' && failure?.code === 'invalid_request') {
      const released = await getPrisma().$transaction(async (tx) => {
        const { count } = await tx.order.updateMany({
          where: { id: order.id, paymentId: null, status: 'RESERVED' },
          data: { status: 'CANCELLED' },
        });
        if (count) await releaseStock(tx, order.items);
        return count;
      });
      if (released) throw new CheckoutError('ЮKassa отклонила заказ. Проверь данные и попробуй снова.', true);
    }
    throw new Error(`ЮKassa: HTTP ${response.status}`);
  }
  const payment: Payment = await response.json();
  if (!payment.id || payment.metadata?.orderId !== order.id) throw new Error('Платёж не сопоставлен с заказом.');
  const confirmationUrl = payment.confirmation?.confirmation_url;
  await getPrisma().order.updateMany({
    where: { id: order.id, OR: [{ paymentId: null }, { paymentId: payment.id }] },
    data: { paymentId: payment.id, confirmationUrl },
  });
  if (payment.status === 'succeeded' || payment.status === 'canceled') {
    await settleOrder(payment);
    return returnUrl.href;
  }
  if (!confirmationUrl) throw new Error('ЮKassa не вернула ссылку оплаты.');
  return confirmationUrl;
}

async function releaseStock(
  tx: Prisma.TransactionClient,
  items: { productId: number; quantity: number }[],
) {
  for (const item of items) {
    await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
  }
}

export async function settleOrder(payment: Payment) {
  const id = payment.metadata?.orderId;
  const status = payment.status === 'succeeded' ? 'PAID' : payment.status === 'canceled' ? 'CANCELLED' : null;
  if (!id || !uuidPattern.test(id) || !status) return null;

  return getPrisma().$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: { orderBy: { productId: 'asc' } } },
    });
    if (!order || (order.paymentId && order.paymentId !== payment.id) ||
        payment.amount.currency !== 'RUB' || payment.amount.value !== rubles(order.amountKopecks)) return null;

    const { count } = await tx.order.updateMany({
      where: { id, status: 'RESERVED', OR: [{ paymentId: null }, { paymentId: payment.id }] },
      data: { status, paymentId: payment.id, confirmationUrl: null },
    });
    if (count && status === 'CANCELLED') await releaseStock(tx, order.items);
    return tx.order.findUnique({ where: { id }, include: { items: true } });
  });
}
