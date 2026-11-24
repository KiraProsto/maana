import Image from 'next/image';
import Link from 'next/link';
import type { SessionPayload } from '@/app/lib/auth/token';
import { logout } from '../actions';
import styles from '../products.module.css';

const roleNames = {
  developer: 'Разработчик',
  admin: 'Администратор',
};

export default function AdminSidebar({ session }: { session: SessionPayload }) {
  return (
      <aside className={styles.sidebar}>
        <div>
          <Link className={styles.brand} href="/admin">
            <Image src="/logo.svg" alt="МААНА" width={30} height={30} />
            <span>
              <strong>МААНА</strong>
              <small>Админ-панель</small>
            </span>
          </Link>

          <nav className={styles.navigation} aria-label="Разделы админ-панели">
            <Link href="/admin" aria-current="page">Товары</Link>
            <span aria-disabled="true">Мастер-классы</span>
            <span aria-disabled="true">Настройки</span>
          </nav>
        </div>

        <div className={styles.account}>
          <Link href="/">Открыть сайт</Link>
          <div>
            <strong>{session.login}</strong>
            <small>{roleNames[session.role]}</small>
          </div>
          <form action={logout}>
            <button className={styles.secondaryButton} type="submit">Выйти</button>
          </form>
        </div>
      </aside>

  );
}
