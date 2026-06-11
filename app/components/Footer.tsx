'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* БРЕНД */}
        <div className={styles.footerBrand}>
          <div className={styles.footerLogoRow}>
            <Image
              src="/logo.png"
              alt="Логотип МААНА"
              width={48}
              height={48}
              className={styles.footerLogoImg}
            />
            <div className={styles.footerLogoText}>MAAHA</div>
          </div>
          <div className={styles.footerTagline}>натуральный уход</div>
        </div>

        {/* НАВИГАЦИЯ */}
        <nav className={styles.footerNav} aria-label="Навигация в футере">
          <div className={styles.footerCol}>
            <span className={styles.footerColLabel}>меню</span>
            <Link href="/#home">Главная</Link>
            <Link href="/catalog">Каталог</Link>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.footerColLabel}>о бренде</span>
            <Link href="/#composition">Состав</Link>
            <Link href="/#about">О нас</Link>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.footerColLabel}>помощь</span>
            <Link href="/#delivery">Доставка</Link>
            <Link href="/#contacts">Контакты</Link>
          </div>
        </nav>
      </div>

      {/* НИЖНЯЯ ПОЛОСА */}
      <div className={styles.footerBottom}>
        <div className={styles.footerMeta}>
          <span>ИНН 482308032032</span>
          <span className={styles.footerSep}>·</span>
          <span>Самозанятая: Ю.С. Булатова</span>
          <span className={styles.footerSep}>·</span>
          <a href="tel:+79785278375">+7 (978) 527-83-75</a>
          <span className={styles.footerSep}>·</span>
          <a href="mailto:juliya.ist0508@gmail.com">juliya.ist0508@gmail.com</a>
        </div>

        <div className={styles.footerDocs}>
          <Link href="/docs/privacy" target="_blank" rel="noopener noreferrer">
            Политика конфиденциальности
          </Link>
          <Link href="/docs/offer" target="_blank" rel="noopener noreferrer">
            Публичная оферта
          </Link>
          <Link href="/docs/terms" target="_blank" rel="noopener noreferrer">
            Пользовательское соглашение
          </Link>
          <Link href="/docs/cookies" target="_blank" rel="noopener noreferrer">
            Политика cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
