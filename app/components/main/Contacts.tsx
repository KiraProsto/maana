import Image from 'next/image';
import styles from './Contacts.module.css';

export default function Contacts() {
  return (
    <section
      className={styles.contacts}
      id="contacts"
      role="region"
      aria-labelledby="contacts-title">
      <h2 id="contacts-title" className={styles.contactsTitle}>
        КОНТАКТНЫЕ ДАННЫЕ
      </h2>

      {/* Контактная информация */}
      <div className={styles.contactsInfo}>
        <p className={styles.contactsPhone}>
          <a
            href="tel:+79785278375"
            aria-label="Позвонить по номеру +7 978 527 83 75">
            +7 (978) 527‑83‑75
          </a>
        </p>

        <p className={styles.contactsMail}>
          <a
            href="mailto:juliya.ist0508@gmail.com"
            aria-label="Написать на электронную почту juliya.ist0508@gmail.com">
            juliya.ist0508@gmail.com
          </a>
        </p>
      </div>

      <p className={styles.contactsSubtitle}>
        Остались вопросы? Нужна запись? Напишите!
      </p>

      {/* Социальные ссылки */}
      <div className={styles.contactsIcons} role="list">
        <a
          href="https://max.ru/u/f9LHodD0cOIr-W0FBa3_vxtJcRG8Q_nSDP5cOTUofBVzeVgrKyBM-jZyqtM"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactsIconLink}
          role="listitem"
          aria-label="Написать в Max">
          <Image
            src="/icons/message/max.svg"
            alt=""
            aria-hidden="true"
            width={50}
            height={50}
            className={styles.contactsIcon}
          />
        </a>

        <a
          href="https://t.me/HyggeCandleS"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactsIconLink}
          role="listitem"
          aria-label="Написать в Telegram">
          <Image
            src="/icons/message/tg.svg"
            alt=""
            aria-hidden="true"
            width={50}
            height={50}
            className={styles.contactsIcon}
          />
        </a>

        <a
          href="https://vk.ru/hugge_aura"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactsIconLink}
          role="listitem"
          aria-label="Перейти в группу ВКонтакте">
          <Image
            src="/icons/message/vk.svg"
            alt=""
            aria-hidden="true"
            width={50}
            height={50}
            className={styles.contactsIcon}
          />
        </a>
      </div>
    </section>
  );
}
