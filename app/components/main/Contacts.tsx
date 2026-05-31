'use client';

import Image from 'next/image';
import styles from './Contacts.module.css';

export default function Contacts() {
  return (
    <section className={styles.contacts} id="contacts">
      <h2 className={styles.contactsTitle}>КОНТАКТНЫЕ ДАННЫЕ</h2>

      <div className={styles.contactsInfo}>
        <p className={styles.contactsPhone}>+7 (978) 527‑83‑75</p>
        <p className={styles.contactsMail}>juliya.ist0508@gmail.com</p>
      </div>

      <p className={styles.contactsSubtitle}>
        Остались вопросы? Нужна запись? Напиши!
      </p>

      <div className={styles.contactsIcons}>
        <a
          href="https://max.ru/u/f9LHodD0cOIr-W0FBa3_vxtJcRG8Q_nSDP5cOTUofBVzeVgrKyBM-jZyqtM"
          target="_blank"
          className={styles.contactsIconLink}>
          <Image
            src="/icons/message/max.svg"
            alt="MAX"
            width={50}
            height={50}
            className={styles.contactsIcon}
          />
        </a>

        <a
          href="https://t.me/HyggeCandleS"
          target="_blank"
          className={styles.contactsIconLink}>
          <Image
            src="/icons/message/tg.svg"
            alt="Telegram"
            width={50}
            height={50}
            className={styles.contactsIcon}
          />
        </a>

        <a
          href="https://vk.ru/hugge_aura"
          target="_blank"
          className={styles.contactsIconLink}>
          <Image
            src="/icons/message/vk.svg"
            alt="VK"
            width={50}
            height={50}
            className={styles.contactsIcon}
          />
        </a>
      </div>
    </section>
  );
}
