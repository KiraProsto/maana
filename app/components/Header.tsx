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
        aria-label="Открыть меню"
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
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
        <Link
          href="/"
          className={styles.logoLink}
          aria-label="Перейти на главную">
          <Image
            src="/logo.svg"
            alt=""
            width={50}
            height={50}
            aria-hidden="true"
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
          aria-hidden="true"
          width={22}
          height={22}
          className={styles.searchIcon}
        />
        <input
          type="text"
          className={styles.search}
          placeholder="Поиск"
          aria-label="Поиск по сайту"
        />
      </div>

      {/* Иконки справа — мобайл */}
      <div className={styles.headerIcons}>
        <button
          aria-label="Открыть поиск"
          onClick={() => setMobileSearchOpen(true)}
          className={styles.iconButton}>
          <Image
            src="/icons/search-icon.svg"
            alt=""
            aria-hidden="true"
            width={22}
            height={22}
            className={styles.searchIconSmall}
          />
        </button>

        <Link href="/cart" aria-label="Корзина">
          <Image
            src="/icons/bag.svg"
            alt=""
            aria-hidden="true"
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
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Мобильный поиск">
        <input type="search" placeholder="Поиск" aria-label="Поиск по сайту" />
        <button
          className={styles.mobileSearchClose}
          aria-label="Закрыть поиск"
          onClick={() => setMobileSearchOpen(false)}>
          ✕
        </button>
      </div>

      {/* Навигация — ПК */}
      <nav
        id="main-navigation"
        role="navigation"
        aria-label="Основная навигация"
        className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
        <Link href="/">Главная</Link>
        <Link href="/catalog">Каталог</Link>
        <Link href="/#delivery">О доставке</Link>

        <Link href="/cart" className={styles.navCart} aria-label="Корзина">
          <Image
            src="/icons/bag.svg"
            alt=""
            aria-hidden="true"
            width={25}
            height={25}
            className={styles.bagIcon}
          />
        </Link>
      </nav>
    </header>
  );
}
