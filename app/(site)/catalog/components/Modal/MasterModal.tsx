'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import styles from './MasterModal.module.css';

import { formatRubles } from '@/app/lib/catalog/price';
import type { CatalogMasterClass, GalleryItem } from '@/app/lib/catalog/types';

interface MasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogMasterClass | null;
}

function Description({ text }: { text: string }) {
  const blocks: { list: boolean; lines: string[] }[] = [];
  let current: (typeof blocks)[number] | undefined;
  for (const line of text.trim().split(/\r?\n/)) {
    const value = line.trim();
    if (!value) {
      current = undefined;
      continue;
    }
    const list = /^·\s*\S/.test(value);
    if (!current || current.list !== list) {
      current = { list, lines: [] };
      blocks.push(current);
    }
    current.lines.push(list ? value.slice(1).trim() : value);
  }

  return (
    <div className={styles.desc}>
      {blocks.map(({ list, lines }, index) => list
        ? <ul key={index}>{lines.map((line, item) => <li key={item}>{line}</li>)}</ul>
        : <p key={index}>{lines.join('\n')}</p>)}
    </div>
  );
}

export default function MasterModal({
  isOpen,
  onClose,
  item,
}: MasterModalProps) {
  const [index, setIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef(0);

  useEffect(() => {
    if (isOpen) modalRef.current?.focus();
  }, [isOpen]);

  const gallery: GalleryItem[] = useMemo(() => {
    if (!item) return [];

    return [
      { type: 'image' as const, src: item.mainImage },
      ...item.media,
    ];
  }, [item]);

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

  if (!isOpen || !item) return null;

  const safeIndex = Math.min(index, gallery.length - 1);
  const hasMultiple = gallery.length > 1;

  const prev = () => setIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setIndex((i) => (i + 1) % gallery.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStart.current;

    if (delta > 50) prev();
    if (delta < -50) next();
  };

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
          <div
            className={styles.imageWrap}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}>
            {gallery.map((g, i) => {
              const active = i === safeIndex;

              if (g.type === 'video') {
                // видео грузим/проигрываем только активное
                return active ? (
                  <video
                    key={i}
                    src={g.src}
                    className={styles.mainVideo}
                    muted
                    playsInline
                    autoPlay
                    loop
                    aria-label={`Видео мастер-класса ${item.title}`}
                  />
                ) : null;
              }

              return (
                <Image
                  key={i}
                  src={g.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 90vw, 600px"
                  priority={i === 0}
                  className={styles.mainImage}
                  style={{
                    objectFit: 'cover',
                    opacity: active ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                    pointerEvents: active ? 'auto' : 'none',
                  }}
                  aria-hidden={!active}
                />
              );
            })}

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
            <Description text={item.description} />
          )}

          <p className={styles.info}>
            <strong>Возраст:</strong> {item.age}
          </p>
          <p className={styles.info}>
            <strong>Время:</strong> {item.duration}
          </p>
          {item.priceKopecks !== null && (
            <p className={styles.info}>
              <strong>Цена:</strong> {formatRubles(item.priceKopecks)}
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
