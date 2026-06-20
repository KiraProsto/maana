'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './ProductsSection.module.css';
import { useCart } from '@/app/context/CartContext';
import dynamic from 'next/dynamic';

const ProductModal = dynamic(() => import('./Modal/ProductModal'), {
  ssr: false,
});

interface IProduct {
  id: number;
  name: string;
  price: string;
  mainImage: string;
  description?: string;
  advantages?: string;
  characteristics?: string;
  gallery?: string[];
}

interface IProps {
  id: string;
  title: string;
  products: IProduct[];
}

export default function ProductsSection({ id, title, products }: IProps) {
  const { cart, add, remove, isReady } = useCart();

  const [modalProduct, setModalProduct] = useState<IProduct | null>(null);

  const openModal = (item: IProduct) => {
    setModalProduct(item);
  };

  return (
    <section
      id={id}
      className={styles.interior}
      role="region"
      aria-labelledby={`${id}-title`}>
      <div className={styles.interiorTitleWrap}>
        <h2 id={`${id}-title`} className={styles.interiorTitle}>
          {title}
        </h2>
        <div className={styles.interiorLine} aria-hidden="true"></div>
      </div>

      <div className={styles.interiorGrid}>
        {products.map((item) => {
          const idStr = String(item.id);
          const count = cart[idStr] || 0;

          return (
            <button
              key={item.id}
              className={styles.productCard}
              aria-label={`Открыть товар: ${item.name}`}
              onClick={(e) => {
                if (
                  e.target instanceof HTMLElement &&
                  e.target.closest(`.${styles.productCardBtn}`)
                )
                  return;
                openModal(item);
              }}>
              <Image
                src={item.mainImage}
                alt={item.name}
                width={260}
                height={195}
                className={styles.productCardImg}
              />
              <div className={styles.productCardName}>{item.name}</div>
              <div className={styles.productCardPrice}>{item.price}</div>

              {!isReady ? (
                <div className={styles.productCardBtn}>В корзину</div>
              ) : count === 0 ? (
                <div
                  className={styles.productCardBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    add(idStr);
                  }}>
                  В корзину
                </div>
              ) : (
                <div
                  className={`${styles.productCardBtn} ${styles.counter}`}
                  onClick={(e) => e.stopPropagation()}>
                  <div
                    className={styles.counterBtn}
                    onClick={() => remove(idStr)}
                    aria-label="Уменьшить количество">
                    −
                  </div>
                  <div className={styles.counterValue}>{count}</div>
                  <div
                    className={styles.counterBtn}
                    onClick={() => add(idStr)}
                    aria-label="Увеличить количество">
                    +
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {modalProduct && (
        <ProductModal
          isOpen
          onClose={() => setModalProduct(null)}
          product={{
            id: modalProduct.id,
            name: modalProduct.name,
            description: modalProduct.description || '',
            advantages: modalProduct.advantages || '',
            characteristics: modalProduct.characteristics || '',
            gallery: [
              { type: 'image' as const, src: modalProduct.mainImage },
              ...(modalProduct.gallery || []).map((src) => ({
                type: 'image' as const,
                src,
              })),
            ],
          }}
        />
      )}
    </section>
  );
}
