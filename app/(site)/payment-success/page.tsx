import { getPrisma } from '@/app/lib/prisma';
import { settleOrder } from '@/app/lib/payments/orders';
import { paymentConfig, uuidPattern, yookassa } from '@/app/lib/payments/provider';
import { notifyPaidOrder } from '@/app/lib/payments/notify';
import { usesDatabaseCatalog } from '@/app/lib/catalog/source';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: id } = await searchParams;
  let status: string | undefined;
  if (typeof id === 'string' && uuidPattern.test(id) && process.env.DATABASE_URL) {
    const order = await getPrisma().order.findUnique({
      where: { id },
      select: { status: true, paymentId: true },
    });
    status = order?.status;
    const config = paymentConfig();
    if (status === 'RESERVED' && order?.paymentId && config) {
      try {
        const response = await yookassa('/' + encodeURIComponent(order.paymentId), config.authorization);
        if (response.ok) {
          const payment = await response.json();
          if (payment.id === order.paymentId && payment.metadata?.orderId === id) {
            const settled = await settleOrder(payment);
            status = settled?.status ?? status;
            if (settled) await notifyPaidOrder(settled);
          }
        }
      } catch {
        // Повторная проверка доступна после обновления страницы.
      }
    }
  }

  return (
    <main style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1>Оплата заказа</h1>
      {status === 'PAID' ? <p>Оплата прошла успешно. Мы свяжемся с вами в ближайшее время.</p>
        : status === 'CANCELLED' ? <p>Платёж отменён. Можно оформить заказ заново.</p>
        : status === 'RESERVED' ? <p>Ожидаем подтверждение платежа. Обнови страницу через несколько секунд.</p>
        : !id && !usesDatabaseCatalog() ? <p>Мы проверяем оплату. После подтверждения мы свяжемся с вами.</p>
        : <p>Статус заказа недоступен. Если деньги списались, свяжись с магазином.</p>}
      {status && <p>Номер заказа: {id}</p>}
    </main>
  );
}
