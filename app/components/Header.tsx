'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className={styles.header}>
      {/* Бургер */}
      <button
        aria-label="Меню"
        onClick={() => setMenuOpen(!menuOpen)}
        className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
        style={{
          mask: menuOpen
            ? "url('/icons/close.png') center/contain no-repeat"
            : "url('/icons/burger.png') center/contain no-repeat",
          WebkitMask: menuOpen
            ? "url('/icons/close.png') center/contain no-repeat"
            : "url('/icons/burger.png') center/contain no-repeat",
        }}
      />

      {/* Центрированный логотип */}
      <div className={styles.headerCenter}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/logo.svg"
            alt="Логотип"
            width={50}
            height={50}
            className={styles.logoImg}
          />
          <span className={styles.logo}>MAAHA</span>
        </Link>
      </div>

      {/* Поиск — ПК */}
      <div className={`${styles.searchWrapper} ${styles.desktopSearch}`}>
        <Image
          src="/icons/search-icon.svg"
          alt=""
          width={22}
          height={22}
          className={styles.searchIcon}
        />
        <input type="text" className={styles.search} placeholder="Поиск" />
      </div>

      {/* Иконки справа — мобайл */}
      <div className={styles.headerIcons}>
        <Image
          src="/icons/search-icon.svg"
          alt="Поиск"
          width={22}
          height={22}
          className={styles.searchIconSmall}
          onClick={() => setMobileSearchOpen(true)}
        />
        <Link href="/cart">
          <Image
            src="/icons/bag.svg"
            alt="Корзина"
            width={25}
            height={25}
            className={styles.bagIcon}
          />
        </Link>
      </div>

      {/* Мобильный поиск */}
      <div
        className={`${styles.mobileSearch} ${
          mobileSearchOpen ? styles.mobileSearchOpen : ''
        }`}>
        <input type="text" placeholder="Поиск" />
        <div
          className={styles.mobileSearchClose}
          onClick={() => setMobileSearchOpen(false)}>
          ✕
        </div>
      </div>

      {/* Навигация — ПК */}
      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
        <Link href="/">Главная</Link>
        <Link href="/catalog">Каталог</Link>
        <Link href="/#delivery">О доставке</Link>

        <Link href="/cart" className={styles.navCart}>
          <Image
            src="/icons/bag.svg"
            alt="Корзина"
            width={25}
            height={25}
            className={styles.bagIcon}
          />
        </Link>
      </nav>
    </header>
  );
}
