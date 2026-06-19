'use client';

import styles from './Hero.module.css';
import Link from 'next/link';

export default function Hero() {
  return (
    <section
      className={styles.hero}
      id="home"
      aria-label="Главный баннер сайта МААНА"
      role="banner">
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className={styles.tickerText}>
              MAAHA теперь с тобой. Добро пожаловать в ароматный дом.
            </span>
          ))}
        </div>
      </div>

      <video
        className={styles.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/main/main.webp"
        aria-hidden="true"
        tabIndex={-1}>
        <source src="/video/main/hero.mp4" type="video/mp4" />
      </video>

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>MAAHA</h1>
        <p className={styles.heroSubtitle}>Твой момент, наполненный собой.</p>
        <Link
          href="/catalog"
          className={styles.heroBtn}
          aria-label="Перейти в каталог товаров">
          Каталог
        </Link>
      </div>
    </section>
  );
}
