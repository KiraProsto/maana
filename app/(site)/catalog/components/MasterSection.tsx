'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './MasterSection.module.css';
import { masterClasses } from '@/app/data/masterClasses';
import dynamic from 'next/dynamic';

const MasterModal = dynamic(() => import('./Modal/MasterModal'), {
  ssr: false,
});
type MasterClass = (typeof masterClasses)[number];

export default function MasterSection() {
  const [selected, setSelected] = useState<MasterClass | null>(null);

  const openModal = (item: MasterClass) => setSelected(item);

  return (
    <section
      className={styles.master}
      id="master"
      role="region"
      aria-labelledby="master-title">
      <div className={styles.masterTitleWrap}>
        <h2 id="master-title" className={styles.masterTitle}>
          МАСТЕР‑КЛАССЫ
        </h2>
        <div className={styles.masterLine} aria-hidden="true"></div>
      </div>

      <div className={styles.masterCards}>
        {masterClasses.map((item, index) => (
          <button
            key={index}
            className={styles.masterCard}
            role="button"
            aria-label={`Открыть мастер-класс: ${item.title}`}
            onClick={() => openModal(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') openModal(item);
            }}>
            <Image
              src={item.mainImage}
              alt={item.title}
              fill
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="(max-width: 420px) 180px, (max-width: 768px) 215px, (max-width: 1024px) 270px, 310px"
              className={styles.masterCardImg}
            />

            <div className={styles.masterCardAge}>{item.age}</div>

            <div className={styles.masterCardBottom}>
              <div className={styles.masterCardTitle}>{item.title}</div>
              <div className={styles.masterCardTime}>
                <Image
                  src="/icons/time.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="time-icon"
                  aria-hidden="true"
                />
                <span>{item.duration}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <MasterModal isOpen onClose={() => setSelected(null)} item={selected} />
      )}
    </section>
  );
}
