import { Metadata } from 'next';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: 'МААНА | Админ-панель',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.admin}>{children}</div>;
}
