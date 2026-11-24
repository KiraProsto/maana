import Link from 'next/link';
import { verifySession } from '@/app/lib/auth/session';
import AdminSidebar from '../components/AdminSidebar';
import styles from '../products.module.css';
import { getAdminMasterClasses } from './data';
import MasterClassCards from './MasterClassCards';
import cards from './masterclasses.module.css';

export default async function MasterClassesPage() {
  const session = await verifySession();
  const classes = process.env.DATABASE_URL ? await getAdminMasterClasses() : null;

  return (
    <div className={styles.dashboard}>
      <AdminSidebar session={session} section="masterclasses" />
      <main className={styles.content} aria-labelledby="masterclasses-title">
        <div className={styles.pageHeading}>
          <h1 id="masterclasses-title">Мастер-классы</h1>
          {classes && <Link className={styles.primaryLink} href="/admin/masterclasses/new">+ Новый мастер-класс</Link>}
        </div>
        {classes ? (
          <section aria-labelledby="masterclasses-formats">
            <h2 id="masterclasses-formats" className={cards.sectionTitle}>Форматы</h2>
            <MasterClassCards items={classes} />
          </section>
        ) : <p role="status">Укажи DATABASE_URL в .env.local и перезапусти сайт.</p>}
      </main>
    </div>
  );
}
