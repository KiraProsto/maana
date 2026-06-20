import styles from './CatalogSection.module.css';

export default function CatalogSection() {
  return (
    <section
      id="catalog"
      className={styles.catalog}
      role="region"
      aria-labelledby="catalog-title">
      <div className={styles.catalogTitleWrap}>
        <div className={styles.catalogLine} aria-hidden="true"></div>

        <h2 id="catalog-title" className={styles.catalogTitle}>
          КАТАЛОГ
        </h2>

        <div className={styles.catalogLine} aria-hidden="true"></div>
      </div>

      <div className={styles.catalogGrid}>
        <a
          href="#holders"
          className={`${styles.catalogItem} ${styles.catalogItemBig}`}
          aria-label="Перейти к разделу Ароматические свечи">
          <video
            src="/video/catalog/aroma.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            preload="none"
            poster="/catalog/aroma.webp"
            tabIndex={-1}
            className={styles.catalogVideo}
          />
          <div className={styles.catalogOverlay}>Ароматические свечи</div>
        </a>

        <div className={styles.catalogRight}>
          <a
            href="#master"
            className={`${styles.catalogItem} ${styles.catalogItemSquare}`}
            aria-label="Перейти к разделу Мастер‑классы">
            <video
              src="/video/catalog/master.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              preload="none"
              poster="/catalog/master.webp"
              tabIndex={-1}
              className={styles.catalogVideo}
            />
            <div className={styles.catalogOverlay}>Мастер‑классы</div>
          </a>

          <a
            href="#interior"
            className={`${styles.catalogItem} ${styles.catalogItemSquare}`}
            aria-label="Перейти к разделу Интерьерные свечи">
            <video
              src="/video/catalog/interior.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              preload="none"
              poster="/catalog/interior.webp"
              tabIndex={-1}
              className={styles.catalogVideo}
            />
            <div className={styles.catalogOverlay}>Интерьерные свечи</div>
          </a>

          <a
            href="#sachets"
            className={`${styles.catalogItem} ${styles.catalogItemWide}`}
            aria-label="Перейти к разделу Аромасаше">
            <video
              src="/video/catalog/sashe.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster="/catalog/sashe.webp"
              aria-hidden="true"
              tabIndex={-1}
              className={styles.catalogVideo}
            />
            <div className={styles.catalogOverlay}>Аромасаше</div>
          </a>
        </div>
      </div>
    </section>
  );
}
