import Image from 'next/image';
import styles from './Composition.module.css';

export default function Composition() {
  return (
    <section
      className={styles.composition}
      id="composition"
      role="region"
      aria-labelledby="composition-title">
      <h2 id="composition-title" className={styles.compositionTitle}>
        СОСТАВ СВЕЧЕЙ
      </h2>

      <div className={styles.compositionLayout}>
        <div
          className={`${styles.compositionCol} ${styles.left}`}
          aria-label="Описание материалов свечи">
          <div className={styles.compositionItem}>
            <div className={styles.compositionItemHeader}>
              <Image
                src="/icons/oil.svg"
                alt="Иконка ароматических масел"
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
                src="/icons/wax.svg"
                alt="Иконка натурального воска"
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

        <div className={styles.compositionCenter}>
          <Image
            src="/main/candle.webp"
            alt="Свеча МААНА"
            fill
            sizes="(max-width: 420px) 250px,
         (max-width: 768px) 250px,
         (max-width: 1024px) 350px,
         450px"
            className={styles.compositionCenterImg}
          />
        </div>

        <div
          className={`${styles.compositionCol} ${styles.right}`}
          aria-label="Описание дополнительных элементов свечи">
          <div className={styles.compositionItem}>
            <div className={styles.compositionItemHeader}>
              <Image
                src="/icons/wick.svg"
                alt="Иконка фитилей"
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
                src="/icons/cup.svg"
                alt="Иконка подсвечника"
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
