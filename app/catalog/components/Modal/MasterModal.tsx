'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './MasterModal.module.css';

interface GalleryItem {
  type: 'image' | 'video';
  src: string;
}

interface MasterClass {
  title: string;
  description: string;
  age: string;
  duration: string;
  price: string;
  mainImage: string;
  images: string[];
}

interface MasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MasterClass | null;
}

export default function MasterModal({
  isOpen,
  onClose,
  item,
}: MasterModalProps) {
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

  if (!isOpen || !item) return null;

  const gallery: GalleryItem[] = [
    { type: 'image', src: item.mainImage },
    ...(item.images || []).map((src) => ({
      type: (src.endsWith('.mp4') ? 'video' : 'image') as 'video' | 'image',
      src,
    })),
  ];

  if (!gallery.length) return null;

  const safeIndex = Math.min(index, gallery.length - 1);
  const current = gallery[safeIndex];

  const hasMultiple = gallery.length > 1;

  const prev = () => setIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setIndex((i) => (i + 1) % gallery.length);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="master-modal-title"
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
                alt={item.title}
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
                aria-label={`Видео мастер-класса ${item.title}`}
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
          <h3 id="master-modal-title" className={styles.title}>
            {item.title}
          </h3>

          {item.description && (
            <p className={styles.desc}>{item.description}</p>
          )}

          <p className={styles.info}>
            <strong>Возраст:</strong> {item.age}
          </p>
          <p className={styles.info}>
            <strong>Время:</strong> {item.duration}
          </p>
          {item.price && (
            <p className={styles.info}>
              <strong>Цена:</strong> {item.price}
            </p>
          )}

          <p className={styles.infoTel}>
            <strong>Записаться:</strong> +7 (978) 527‑83‑75
          </p>

          <div className={styles.socials}>
            <a
              href="https://max.ru/u/f9LHodD0cOIr-W0FBa3_vxtJcRG8Q_nSDP5cOTUofBVzeVgrKyBM-jZyqtM"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в MAX">
              <Image
                src="/icons/message/max.svg"
                alt=""
                width={38}
                height={38}
              />
            </a>
            <a
              href="https://t.me/HyggeCandleS"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в Telegram">
              <Image
                src="/icons/message/tg.svg"
                alt=""
                width={38}
                height={38}
              />
            </a>
            <a
              href="https://vk.ru/hugge_aura"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в VK">
              <Image
                src="/icons/message/vk.svg"
                alt=""
                width={38}
                height={38}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
