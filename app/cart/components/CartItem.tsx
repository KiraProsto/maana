'use client';

import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import styles from '../CartPage.module.css';
import { ICartProduct } from '../types';
import { useRouter } from 'next/navigation';

interface ICartItemProps {
  item: ICartProduct;
}

export default function CartItem({ item }: ICartItemProps) {
  const { add, remove, removeAll } = useCart();
  const router = useRouter();

  const idStr = String(item.id);

  return (
    <div
      className={styles.cartItem}
      role="group"
      aria-label={`Товар ${item.name}`}>
      <Image
        src={item.mainImage}
        alt={`Изображение товара ${item.name}`}
        width={100}
        height={100}
        className={styles.cartItemImg}
      />

      <div className={styles.cartItemCenter}>
        <div className={styles.cartItemName} aria-label="Название товара">
          {item.name}
        </div>
        <div className={styles.cartItemPrice} aria-label={`Стоимость`}>
          {item.price * item.count} руб
        </div>
      </div>

      <div
        className={styles.cartItemCounter}
        role="group"
        aria-label="Счетчик количества">
        <button
          className={styles.counterBtn}
          onClick={() => remove(idStr)}
          aria-label="Уменьшить количество">
          −
        </button>

        <div
          className={styles.counterValue}
          aria-live="polite"
          aria-atomic="true">
          {item.count}
        </div>

        <button
          className={styles.counterBtn}
          onClick={() => add(idStr)}
          aria-label="Увеличить количество">
          +
        </button>
      </div>

      <button
        className={styles.cartItemBuy}
        onClick={() => {
          router.push('/checkout');
        }}
        aria-label={`Купить товар ${item.name} и перейти к оформлению`}>
        Купить
      </button>

      <button
        className={styles.cartItemDelete}
        onClick={() => removeAll(idStr)}
        aria-label="Удалить товар из корзины">
        ×
      </button>
    </div>
  );
}
