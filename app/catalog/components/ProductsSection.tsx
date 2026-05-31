'use client';

import Image from 'next/image';
import styles from './ProductsSection.module.css';

interface IProduct {
  id: number;
  name: string;
  price: string;
  image: string;
}

interface IProps {
  id: string;
  title: string;
  products: IProduct[];
}

export default function ProductsSection({ id, title, products }: IProps) {
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
        {products.map((item) => (
          <div
            key={item.id}
            className={styles.productCard}
            role="button"
            tabIndex={0}
            aria-label={`Открыть товар: ${item.name}`}
            onClick={() => console.log('Открыть модалку', item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') console.log('Открыть модалку', item);
            }}>
            <Image
              src={item.image}
              alt={item.name}
              width={260}
              height={195}
              className={styles.productCardImg}
            />

            <div className={styles.productCardName}>{item.name}</div>

            <div className={styles.productCardPrice}>{item.price}</div>

            <div className={styles.productCardBtn}>В корзину</div>
          </div>
        ))}
      </div>
    </section>
  );
}
