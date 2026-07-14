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

  return (
    <section className={styles.hits} id="hits">
      <h2 className={styles.hitsTitle}>ХИТ ПРОДАЖ</h2>
      <div className={styles.hitsList} aria-label="Популярные товары">
        {hits.map((product) => (
          <div key={product.id} className={styles.hitsItem} aria-hidden="true">
            <div className={styles.hitsImageWrapper}>
              <Image
                src={product.mainImage}
                alt={`Изображение товара: ${product.name}`}
                fill
                sizes="(max-width: 420px) 160px,(max-width: 768px) 190px,(max-width: 1024px) 290px,400px"
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
