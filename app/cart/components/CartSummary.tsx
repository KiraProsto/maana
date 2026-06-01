'use client';

import styles from '../CartPage.module.css';
import { ICartProduct } from '../types';
import { useRouter } from 'next/navigation';

interface ICartSummaryProps {
  items: ICartProduct[];
}

export default function CartSummary({ items }: ICartSummaryProps) {
  const router = useRouter();

  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.count * item.price,
    0,
  );

  return (
    <div
      className={styles.cartSummary}
      role="region"
      aria-label="Сводка заказа">
      <h3 className={styles.cartSummaryTitle}>Ваш заказ</h3>

      <p className={styles.cartSummaryLine}>
        Товаров:{' '}
        <span aria-live="polite" aria-atomic="true">
          {totalCount} шт
        </span>
      </p>

      <p className={styles.cartSummaryLine}>
        Итого:{' '}
        <span aria-live="polite" aria-atomic="true">
          {totalPrice} руб
        </span>
      </p>

      <button
        className={styles.cartBtn}
        onClick={() => router.push('/checkout')}
        aria-label="Перейти к оформлению заказа">
        Оформить заказ
      </button>
    </div>
  );
}
