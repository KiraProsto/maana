'use client';

import Image from 'next/image';
import styles from './Composition.module.css';

export default function Composition() {
  return (
    <section className={styles.composition} id="composition">
      <h2 className={styles.compositionTitle}>СОСТАВ СВЕЧЕЙ</h2>

      <div className={styles.compositionLayout}>
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className={`${styles.compositionCol} ${styles.left}`}>
          <div className={styles.compositionItem}>
            <div className={styles.compositionItemHeader}>
              <Image
                src="/icons/oil.png"
                alt=""
                width={40}
                height={40}
                className={styles.compositionIcon}
              />
              <h3 className={styles.compositionName}>Ароматические масла</h3>
            </div>

            <div className={styles.compositionLine}></div>

            <p className={styles.compositionText}>
              Профессиональные сертифицированные ароматические масла. <br />
              Без вредных веществ и фталатов
            </p>
          </div>

          <div className={styles.compositionItem}>
            <div className={styles.compositionItemHeader}>
              <Image
                src="/icons/wax.png"
                alt=""
                width={40}
                height={40}
                className={styles.compositionIcon}
              />
              <h3 className={styles.compositionName}>
                Натуральный воск <br />
                <span className={styles.compositionText}>
                  (соевый, кокосовый и пчелиный)
                </span>
              </h3>
            </div>

            <div className={styles.compositionLine}></div>

            <p className={styles.compositionText}>
              Обеспечивает чистое и ровное горение без токсинов. <br />
              Дольше держит аромат и создаёт мягкое, тёплое свечение.
            </p>
          </div>
        </div>

        {/* ЦЕНТР */}
        <div className={styles.compositionCenter}>
          <Image
            src="/main/candle.png"
            alt="Свеча МААНА"
            fill
            className={styles.compositionCenterImg}
          />
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className={`${styles.compositionCol} ${styles.right}`}>
          <div className={styles.compositionItem}>
            <div className={styles.compositionItemHeader}>
              <Image
                src="/icons/wick.png"
                alt=""
                width={40}
                height={40}
                className={styles.compositionIcon}
              />
              <h3 className={styles.compositionName}>
                Натуральные фитили <br />
                <span className={styles.compositionText}>
                  (хлопковый и деревянный)
                </span>
              </h3>
            </div>

            <div className={styles.compositionLine}></div>

            <p className={styles.compositionText}>
              Хлопковый — для мягкого пламени и раскрытия тонких ароматов.{' '}
              <br />
              Деревянный — для нежного потрескивания живого огня.
            </p>
          </div>

          <div className={styles.compositionItem}>
            <div className={styles.compositionItemHeader}>
              <Image
                src="/icons/cup.png"
                alt=""
                width={40}
                height={40}
                className={styles.compositionIcon}
              />
              <h3 className={styles.compositionName}>Изящный подсвечник</h3>
            </div>

            <div className={styles.compositionLine}></div>

            <p className={styles.compositionText}>
              Ручная отливка и роспись, приятная текстура. <br />
              Каждая свеча — уникальный элемент декора.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
