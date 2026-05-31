'use client';

import Image from 'next/image';
import styles from './MasterSection.module.css';
import { masterClasses } from '@/app/data/masterClasses';

export default function MasterSection() {
  return (
    <section
      className={styles.master}
      id="master"
      role="region"
      aria-labelledby="master-title">
      {/* Заголовок */}
      <div className={styles.masterTitleWrap}>
        <h2 id="master-title" className={styles.masterTitle}>
          МАСТЕР‑КЛАССЫ
        </h2>
        <div className={styles.masterLine} aria-hidden="true"></div>
      </div>

      {/* Карточки */}
      <div className={styles.masterCards}>
        {masterClasses.map((item, index) => (
          <div
            key={index}
            className={styles.masterCard}
            role="button"
            tabIndex={0}
            aria-label={`Открыть мастер-класс: ${item.title}`}
            onClick={() => console.log('Открыть модалку', item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') console.log('Открыть модалку', item);
            }}>
            {/* Фото */}
            <Image
              src={item.mainImage}
              alt={item.title}
              fill
              className={styles.masterCardImg}
            />

            {/* Возраст */}
            <div className={styles.masterCardAge}>{item.age}</div>

            {/* Нижний блок */}
            <div className={styles.masterCardBottom}>
              <div className={styles.masterCardTitle}>{item.title}</div>

              <div className={styles.masterCardTime}>
                <Image
                  src="/icons/time.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="time-icon"
                />
                <span>{item.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
