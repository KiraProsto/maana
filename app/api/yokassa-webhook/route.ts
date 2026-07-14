import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const event = await req.json();

  if (event.event === 'payment.succeeded') {
    const payment = event.object;
    const meta = payment.metadata || {};

    let items: { name: string; count: number; price: number }[] = [];
    try {
      items = JSON.parse(meta.items || '[]');
    } catch {
      items = [];
    }

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
      <p><b>Адрес:</b> ${meta.city || ''}, ${meta.street || ''}, д. ${meta.house || ''}${meta.flat ? `, кв./офис ${meta.flat}` : ''}</p>
      <p><b>Способ доставки:</b> ${meta.delivery || '-'}</p>
      <p><b>Комментарий:</b> ${meta.comment || '-'}</p>
      <p><b>Товары:</b></p>
      <ul>${itemsHtml}</ul>
      <p><b>ID платежа:</b> ${payment.id}</p>
    `;

    try {
      await resend.emails.send({
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
