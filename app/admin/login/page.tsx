import { Metadata } from 'next';
import styles from '../admin.module.css';
import LoginForm from '../components/LoginForm';

export const metadata: Metadata = {
  title: 'МААНА | Вход',
};

export default function LoginPage() {
  return (
    <main className={styles.login} aria-labelledby="login-title">
      <div className={styles.loginCard}>
        <span className={styles.logo} aria-hidden="true">
          MAAHA
        </span>
        <h1 id="login-title" className={styles.loginTitle}>
          ВХОД
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
