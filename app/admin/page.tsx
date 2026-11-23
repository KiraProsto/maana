import styles from './admin.module.css';
import { verifySession } from '@/app/lib/auth/session';
import { logout } from './actions';

const roleNames = {
  developer: 'Разработчик',
  admin: 'Администратор',
};

export default async function AdminPage() {
  const session = await verifySession();

  return (
    <main className={styles.dashboard} aria-labelledby="admin-title">
      <div className={styles.dashboardHeader}>
        <h1 id="admin-title" className={styles.dashboardTitle}>
          АДМИН-ПАНЕЛЬ
        </h1>

        <form action={logout}>
          <button className={styles.logoutBtn} type="submit">
            Выйти
          </button>
        </form>
      </div>

      <p className={styles.dashboardNote}>
        {roleNames[session.role]}: {session.login}
      </p>
    </main>
  );
}
