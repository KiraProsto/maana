'use client';

import Image from 'next/image';
import styles from './PreorderModal.module.css';

interface PreorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export default function PreorderModal({
  isOpen,
  onClose,
  productName,
}: PreorderModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Оформить предзаказ"
        onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть">
          ×
        </button>

        <h3 className={styles.title}>Под заказ</h3>

        {productName && <p className={styles.product}>{productName}</p>}

        <p className={styles.desc}>
          Товара временно нет в наличии. <br />
          Свяжитесь с нами, чтобы оформить предзаказ — мы сообщим о сроках и
          наличии.
        </p>

        <p className={styles.tel}>
          <strong>Телефон:</strong> +7 (978) 527‑83‑75
        </p>

        <div className={styles.socials}>
          <a
            href="https://max.ru/u/f9LHodD0cOIr-W0FBa3_vxtJcRG8Q_nSDP5cOTUofBVzeVgrKyBM-jZyqtM"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в MAX">
            <Image src="/icons/message/max.svg" alt="" width={38} height={38} />
          </a>
          <a
            href="https://t.me/HyggeCandleS"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в Telegram">
            <Image src="/icons/message/tg.svg" alt="" width={38} height={38} />
          </a>
          <a
            href="https://vk.ru/hugge_aura"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в VK">
            <Image src="/icons/message/vk.svg" alt="" width={38} height={38} />
          </a>
        </div>
      </div>
    </div>
  );
}
