'use client';

import styles from './PreorderModal.module.css';
import SocialLinks from '@/app/components/SocialLinks';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';
import { phoneHref } from '@/app/lib/site-settings';

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
  const settings = useSiteSettings();
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
          <strong>Телефон:</strong>{' '}
          <a href={phoneHref(settings.phone)}>{settings.phone}</a>
          <br />
          <a href={`mailto:${settings.email}`}>{settings.email}</a>
        </p>
        <SocialLinks settings={settings} className={styles.socials} />
      </div>
    </div>
  );
}
