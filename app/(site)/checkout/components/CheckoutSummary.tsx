'use client';

import { useCart } from '@/app/context/CartContext';
import { products } from '@/app/data/products';
import { holders } from '@/app/data/holders';
import { sachets } from '@/app/data/sachets';
import CheckoutItem, { ICheckoutItem } from './CheckoutItem';
import styles from '../checkout.module.css';
import { useSearchParams } from 'next/navigation';
import { useDelivery } from '@/app/context/DeliveryContext';

export default function CheckoutSummary() {
  const { cart } = useCart();
  const { deliveryCost, deliveryLoading } = useDelivery();
  const params = useSearchParams();

  const singleId = params.get('product');

  const allProducts = [...products, ...holders, ...sachets];

  let items: ICheckoutItem[] = [];

  if (singleId) {
    const product = allProducts.find((p) => p.id === Number(singleId));

    if (product) {
      const count = cart[singleId] || 1;

      items = [
        {
          id: product.id,
          name: product.name,
          price: Number(String(product.price).replace(/\D/g, '')),
          mainImage: product.mainImage,
          count,
        },
      ];
    }
  }

  if (!singleId) {
    items = Object.entries(cart)
      .map(([id, count]) => {
        const product = allProducts.find((p) => p.id === Number(id));
        if (!product) return null;

        return {
          id: product.id,
          name: product.name,
          price: Number(String(product.price).replace(/\D/g, '')),
          mainImage: product.mainImage,
          count,
        };
      })
      .filter((item): item is ICheckoutItem => item !== null);
  }

  const sumProducts = items.reduce(
    (sum, item) => sum + item.price * item.count,
    0,
  );

  const total = sumProducts + deliveryCost;

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
          Цена за товары: <span>{sumProducts} руб</span>
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
          Итого: <span>{total} руб</span>
        </p>
      </div>
    </section>
  );
}
