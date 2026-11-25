import { verifySession } from '@/app/lib/auth/session';
import { getSiteSettings } from '@/app/lib/site-settings-server';
import AdminSidebar from '../components/AdminSidebar';
import styles from '../products.module.css';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const session = await verifySession();
  const settings = process.env.DATABASE_URL ? await getSiteSettings() : null;

  return (
    <div className={styles.dashboard}>
      <AdminSidebar session={session} section="settings" />
      <main className={styles.content} aria-labelledby="settings-title">
        {settings ? <SettingsForm settings={settings} /> : (
          <>
            <h1 id="settings-title">Настройки</h1>
            <p role="status">Укажи DATABASE_URL в .env.local и перезапусти сайт.</p>
          </>
        )}
      </main>
    </div>
  );
}
