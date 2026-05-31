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

      <div className={styles.hitsList}>
        {hits.map((product, i) => (
          <div
            key={product.id}
            className={`${styles.hitsItem} ${styles[positions[i]]}`}>
            <div className={styles.hitsImageWrapper}>
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className={styles.hitsImg}
              />
            </div>

            <div className={styles.hitsName}>{product.name}</div>
          </div>
        ))}
      </div>

      <Link href="/catalog" className={styles.hitsLink}>
        Перейти в каталог →
      </Link>
    </section>
  );
}
