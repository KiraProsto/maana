'use client';

import { useCart } from '@/app/context/CartContext';
import { getCartProducts, getCartTotal } from '@/app/lib/catalog/cart';
import { formatRubles } from '@/app/lib/catalog/price';
import type { ProductSummary } from '@/app/lib/catalog/types';
import CheckoutItem from './CheckoutItem';
import styles from '../checkout.module.css';
import { useSearchParams } from 'next/navigation';
import { useDelivery } from '@/app/context/DeliveryContext';

export default function CheckoutSummary({ products }: { products: ProductSummary[] }) {
  const { cart } = useCart();
  const { deliveryCost, deliveryLoading } = useDelivery();
  const params = useSearchParams();
  const items = getCartProducts(products, cart, params.get('product'));
  const sumProducts = getCartTotal(items);
  const total = sumProducts + Math.round(deliveryCost * 100);

  return (
    <section
      className={styles.checkoutSummary}
      aria-label="Сводка заказа"
      role="region">
      <div className={styles.checkoutItems} role="list">
        {items.map((item) => (
          <div role="listitem" key={item.id}>
            <CheckoutItem item={item} />
          </div>
        ))}
      </div>

      <div
        className={styles.checkoutTotal}
        aria-label="Итоговая стоимость заказа">
        <p>
          Цена за товары: <span>{formatRubles(sumProducts)}</span>
        </p>
        <p>
          Доставка:{' '}
          <span>
            {deliveryLoading
              ? 'рассчитывается'
              : deliveryCost > 0
                ? `${deliveryCost} руб`
                : 'рассчитывается'}
          </span>
        </p>
        <p className={styles.checkoutTotalFinal}>
          Итого: <span>{formatRubles(total)}</span>
        </p>
      </div>
    </section>
  );
}
