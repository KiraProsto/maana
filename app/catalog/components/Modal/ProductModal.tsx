'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;

    Promise.resolve().then(() => setIndex(0));
  }, [isOpen]);

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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.close} onClick={onClose}>
          ×
        </div>

        {/* ЛЕВАЯ ЧАСТЬ */}
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
              />
            )}

            {hasMultiple && (
              <>
                <div className={styles.arrowLeft} onClick={prev}>
                  ‹
                </div>
                <div className={styles.arrowRight} onClick={next}>
                  ›
                </div>
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
                />
              ))}
            </div>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ */}
        <div className={styles.right}>
          <h3 className={styles.title}>{product.name}</h3>

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
            <div className={styles.btn}>В корзину</div>
          ) : count === 0 ? (
            <div className={styles.btn} onClick={() => add(idStr)}>
              В корзину
            </div>
          ) : (
            <div className={`${styles.btn} ${styles.counter}`}>
              <div className={styles.counterBtn} onClick={() => remove(idStr)}>
                −
              </div>
              <div className={styles.counterValue}>{count}</div>
              <div className={styles.counterBtn} onClick={() => add(idStr)}>
                +
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
