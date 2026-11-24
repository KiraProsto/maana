'use client';

import { useCart } from '@/app/context/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import styles from '../CartPage.module.css';
import { getCartProducts } from '@/app/lib/catalog/cart';
import type { ProductSummary } from '@/app/lib/catalog/types';

export default function CartLayout({ products }: { products: ProductSummary[] }) {
  const { cart } = useCart();
  const items = getCartProducts(products, cart);

  return (
    <div
      className={styles.cartLayout}
      role="region"
      aria-label="Корзина товаров">
      <div
        className={styles.cartItems}
        role="list"
        aria-label="Список товаров в корзине">
        {items.length === 0 ? (
          <p role="status" aria-live="polite">
            Корзина пуста
          </p>
        ) : (
          items.map((item) => (
            <div role="listitem" key={item.id}>
              <CartItem item={item} />
            </div>
          ))
        )}
      </div>

      <CartSummary items={items} />
    </div>
  );
}
