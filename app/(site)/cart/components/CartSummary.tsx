'use client';

import styles from '../CartPage.module.css';
import { getCartTotal } from '@/app/lib/catalog/cart';
import { formatRubles } from '@/app/lib/catalog/price';
import type { CartProduct } from '@/app/lib/catalog/types';
import { useRouter } from 'next/navigation';

interface ICartSummaryProps {
  items: CartProduct[];
}

export default function CartSummary({ items }: ICartSummaryProps) {
  const router = useRouter();

  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = getCartTotal(items);

  const isEmpty = items.length === 0;

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
          {formatRubles(totalPrice)}
        </span>
      </p>

      <button
        className={`${styles.cartBtn} ${isEmpty ? styles.cartBtnDisabled : ''}`}
        onClick={() => router.push('/checkout')}
        disabled={isEmpty}
        aria-label="Перейти к оформлению заказа">
        Оформить заказ
      </button>
    </div>
  );
}
