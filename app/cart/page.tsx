import styles from './CartPage.module.css';
import CartLayout from './components/CartLayout';

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
