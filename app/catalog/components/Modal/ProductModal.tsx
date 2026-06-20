'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './ProductModal.module.css';
import { useCart } from '@/app/context/CartContext';

interface GalleryItem {
  type: 'image' | 'video';
  src: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    description: string;
    advantages: string;
    characteristics: string;
    gallery: GalleryItem[];
  } | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
}: ProductModalProps) {
  const { cart, add, remove, isReady } = useCart();
  const [index, setIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) modalRef.current?.focus();
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const idStr = String(product.id);
  const count = cart[idStr] || 0;
  const gallery = product.gallery;
  const current = gallery[index];
  const hasMultiple = gallery.length > 1;

  const next = () => setIndex((i) => (i + 1) % gallery.length);
  const prev = () => setIndex((i) => (i - 1 + gallery.length) % gallery.length);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        tabIndex={-1}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть модальное окно">
          ×
        </button>

        <div className={styles.left}>
          <div className={styles.imageWrap}>
            {current.type === 'image' ? (
              <Image
                src={current.src}
                alt={product.name}
                fill
                className={styles.mainImage}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <video
                src={current.src}
                className={styles.mainVideo}
                muted
                playsInline
                autoPlay
                loop
                aria-label={`Видео товара ${product.name}`}
              />
            )}

            {hasMultiple && (
              <>
                <button
                  type="button"
                  className={styles.arrowLeft}
                  onClick={prev}
                  aria-label="Предыдущее изображение">
                  ‹
                </button>

                <button
                  type="button"
                  className={styles.arrowRight}
                  onClick={next}
                  aria-label="Следующее изображение">
                  ›
                </button>
              </>
            )}
          </div>

          {hasMultiple && (
            <div className={styles.dots}>
              {gallery.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Перейти к изображению ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.right}>
          <h3 id="product-modal-title" className={styles.title}>
            {product.name}
          </h3>

          {product.description && (
            <p className={styles.desc}>{product.description}</p>
          )}

          {product.advantages && (
            <>
              <p className={styles.info}>
                <strong>Преимущества:</strong>
              </p>
              <p className={styles.text}>{product.advantages}</p>
            </>
          )}

          {product.characteristics && (
            <>
              <p className={styles.info}>
                <strong>Характеристики:</strong>
              </p>
              <p className={styles.text}>{product.characteristics}</p>
            </>
          )}

          {!isReady ? (
            <button className={styles.btn} type="button">
              В корзину
            </button>
          ) : count === 0 ? (
            <button
              className={styles.btn}
              onClick={() => add(idStr)}
              type="button">
              В корзину
            </button>
          ) : (
            <div className={`${styles.btn} ${styles.counter}`}>
              <button
                type="button"
                className={styles.counterBtn}
                onClick={() => remove(idStr)}
                aria-label="Уменьшить количество">
                −
              </button>

              <div className={styles.counterValue}>{count}</div>

              <button
                type="button"
                className={styles.counterBtn}
                onClick={() => add(idStr)}
                aria-label="Увеличить количество">
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
