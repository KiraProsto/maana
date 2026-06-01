'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './ProductsSection.module.css';
import { useCart } from '@/app/context/CartContext';
import ProductModal from './Modal/ProductModal';

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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<IProduct | null>(null);

  const openModal = (item: IProduct) => {
    setModalProduct(item);
    setModalOpen(true);
  };

  return (
    <section id={id} className={styles.interior}>
      <div className={styles.interiorTitleWrap}>
        <h2 className={styles.interiorTitle}>{title}</h2>
        <div className={styles.interiorLine}></div>
      </div>

      <div className={styles.interiorGrid}>
        {products.map((item) => {
          const idStr = String(item.id);
          const count = cart[idStr] || 0;

          return (
            <div
              key={item.id}
              className={styles.productCard}
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
                loading="eager"
              />
              <div className={styles.productCardName}>{item.name}</div>
              <div className={styles.productCardPrice}>{item.price}</div>

              {!isReady ? (
                <div className={styles.productCardBtn}>В корзину</div>
              ) : count === 0 ? (
                <div
                  className={styles.productCardBtn}
                  onClick={() => add(idStr)}>
                  В корзину
                </div>
              ) : (
                <div className={`${styles.productCardBtn} ${styles.counter}`}>
                  <div
                    className={styles.counterBtn}
                    onClick={() => remove(idStr)}>
                    −
                  </div>
                  <div className={styles.counterValue}>{count}</div>
                  <div className={styles.counterBtn} onClick={() => add(idStr)}>
                    +
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={
          modalProduct
            ? {
                id: modalProduct.id,
                name: modalProduct.name,
                description: modalProduct.description || '',
                advantages: modalProduct.advantages || '',
                characteristics: modalProduct.characteristics || '',
                // mainImage первым, затем остальная галерея
                gallery: [
                  { type: 'image' as const, src: modalProduct.mainImage },
                  ...(modalProduct.gallery || []).map((src) => ({
                    type: 'image' as const,
                    src,
                  })),
                ],
              }
            : null
        }
      />
    </section>
  );
}
