import SocialLinks from '@/app/components/SocialLinks';
import { phoneHref } from '@/app/lib/site-settings';
import type { SiteSettings } from '@/app/lib/site-settings';
import styles from './Contacts.module.css';

export default function Contacts({ settings }: { settings: SiteSettings }) {
  return (
    <section className={styles.contacts} id="contacts" role="region" aria-labelledby="contacts-title">
      <h2 id="contacts-title" className={styles.contactsTitle}>КОНТАКТНЫЕ ДАННЫЕ</h2>
      <div className={styles.contactsInfo}>
        <p className={styles.contactsPhone}>
          <a href={phoneHref(settings.phone)} aria-label={`Позвонить по номеру ${settings.phone}`}>
            {settings.phone}
          </a>
        </p>
        <p className={styles.contactsMail}>
          <a href={`mailto:${settings.email}`} aria-label={`Написать на электронную почту ${settings.email}`}>
            {settings.email}
          </a>
        </p>
      </div>
      <p className={styles.contactsSubtitle}>Остались вопросы? Нужна запись? Напишите!</p>
      <SocialLinks settings={settings} className={styles.contactsIcons}
        iconClassName={styles.contactsIcon} size={50} />
    </section>
  );
}
