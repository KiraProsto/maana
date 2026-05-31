'use client';

import styles from './About.module.css';

export default function About() {
  return (
    <section
      className={styles.about}
      id="about"
      aria-labelledby="about-title"
      role="region">
      <h2 id="about-title" className={styles.aboutTitle}>
        О НАС
      </h2>

      <div className={styles.aboutRow}>
        <div className={styles.aboutText}>
          <p className={`${styles.aboutP} ${styles.aboutPRight}`}>
            Маана — это не просто слово, а состояние. Оно объединяет смысл, суть
            и внутреннее значение — то, что ощущаешь, когда затихаешь и просто
            присутствуешь. В восточной философии «маана» — это скрытая сущность
            за внешней формой: за лепестком розы — любовь, за треском фитиля —
            покой, за мягким светом — возвращение домой.
          </p>

          <p className={styles.aboutP}>
            Мы создаём свечи, аромасаше и проводим мастер‑классы, вкладывая в
            каждое изделие внимание, тепло рук и уважение к материалу. Когда вы
            зажигаете свечу МААНА, начинается маленький ритуал — аромат
            становится проводником в состояние «здесь и сейчас». Наш сайт — это
            приглашение в ароматный дом, где каждый вечер и каждый миг наполнены
            смыслом.
          </p>
        </div>

        <div className={styles.aboutImage}>
          <video
            src="/video/main/about.mp4"
            className={styles.aboutVideo}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </div>
    </section>
  );
}
