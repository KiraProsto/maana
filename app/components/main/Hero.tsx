'use client';

import styles from './Hero.module.css';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.ticker}>
        <div className={styles.tickerTrack}>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className={styles.tickerText}>
              MAAHA теперь с тобой. Добро пожаловать в ароматный дом.
            </span>
          ))}
        </div>
      </div>

      <video className={styles.heroVideo} autoPlay muted loop playsInline>
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>MAAHA</h1>
        <p className={styles.heroSubtitle}>Твой момент, наполненный собой.</p>
        <Link href="/catalog" className={styles.heroBtn}>
          Каталог
        </Link>
      </div>
    </section>
  );
}
