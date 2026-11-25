import styles from './Hero.module.css';
import Link from 'next/link';

export default function Hero({ marqueeText }: { marqueeText: string }) {
  return (
    <section
      className={styles.hero}
      id="home"
      aria-label="Главный баннер сайта МААНА"
      role="banner">
      {marqueeText && (
        <div className={styles.ticker}>
          <div className={styles.tickerTrack}>
            {Array.from({ length: 20 }, (_, index) => (
              <span key={index} className={styles.tickerText} aria-hidden={index > 0}>
                {marqueeText}
              </span>
            ))}
          </div>
        </div>
      )}

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
