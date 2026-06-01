import { Metadata } from 'next';
import styles from './CartPage.module.css';
import CartLayout from './components/CartLayout';

export const metadata: Metadata = {
  title: 'МААНА | Корзина',
};

export default function CartPage() {
  return (
    <main className={styles.cartPage}>
      <div className={styles.cartTitleWrap}>
        <h2 className={styles.cartTitle}>КОРЗИНА</h2>
      </div>

      <CartLayout />
    </main>
  );
}
