'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLeft}>
          <Image
            src="/logo.png"
            alt="Логотип МААНА"
            width={80}
            height={80}
            className={styles.footerLogoImg}
          />
          <div className={styles.footerLogoText}>MAAHA</div>
        </div>

        <nav
          className={styles.footerMenu}
          role="navigation"
          aria-label="Навигация в футере">
          <div className={styles.footerCol}>
            <Link href="/#home">Главная</Link>
            <Link href="/catalog">Каталог</Link>
          </div>

          <div className={styles.footerCol}>
            <Link href="/#composition">Состав</Link>
            <Link href="/#about">О нас</Link>
          </div>

          <div className={styles.footerCol}>
            <Link href="/#delivery">Доставка</Link>
            <Link href="/#contacts">Контакты</Link>
          </div>
        </nav>
      </div>
    </footer>
  );
}
