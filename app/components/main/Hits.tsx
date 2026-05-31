'use client';

import { useEffect, useState } from 'react';
import styles from './Hits.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/app/data/products';

interface IProduct {
  id: number;
  name: string;
  mainImage: string;
}

export default function Hits() {
  const hits: IProduct[] = products.slice(0, 3);

  const [positions, setPositions] = useState(['left', 'center', 'right']);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) => {
        const arr = [...prev];
        arr.unshift(arr.pop()!);
        return arr;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hits} id="hits">
      <h2 className={styles.hitsTitle}>ХИТ ПРОДАЖ</h2>
      <div
        className={styles.hitsList}
        role="list"
        aria-live="off"
        aria-label="Популярные товары">
        {hits.map((product, i) => (
          <div
            key={product.id}
            role="listitem"
            className={`${styles.hitsItem} ${styles[positions[i]]}`}
            aria-hidden={positions[i] !== 'center'}>
            <div className={styles.hitsImageWrapper}>
              <Image
                src={product.mainImage}
                alt={`Изображение товара: ${product.name}`}
                fill
                sizes="(max-width: 420px) 160px,
                  (max-width: 768px) 190px,
                  (max-width: 1024px) 290px,
                  400px"
                className={styles.hitsImg}
              />
            </div>

            <div className={styles.hitsName}>{product.name}</div>
          </div>
        ))}
      </div>

      <Link
        href="/catalog"
        className={styles.hitsLink}
        aria-label="Перейти в каталог товаров">
        Перейти в каталог →
      </Link>
    </section>
  );
}
