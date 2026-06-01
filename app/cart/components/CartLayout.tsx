'use client';

import { useCart } from '@/app/context/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import styles from '../CartPage.module.css';
import { products } from '@/app/data/products';
import { ICartProduct } from '../types';

export default function CartLayout() {
  const { cart } = useCart();

  const items: ICartProduct[] = Object.entries(cart)
    .map(([id, count]) => {
      const product = products.find((p) => p.id === Number(id));
      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        price: Number(String(product.price).replace(/\D/g, '')),
        mainImage: product.mainImage,
        count,
      };
    })
    .filter((item): item is ICartProduct => item !== null);

  return (
    <div className={styles.cartLayout}>
      <div className={styles.cartItems}>
        {items.length === 0 ? (
          <p>Корзина пуста</p>
        ) : (
          items.map((item) => <CartItem key={item.id} item={item} />)
        )}
      </div>

      <CartSummary items={items} />
    </div>
  );
}
