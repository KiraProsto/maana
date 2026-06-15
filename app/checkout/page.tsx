import styles from './checkout.module.css';
import { Metadata } from 'next';
import CheckoutForm from './components/CheckoutForm';
import CheckoutSummary from './components/CheckoutSummary';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'МААНА | Оформление',
};

export default function CheckoutPage() {
  return (
    <main
      className={styles.checkout}
      aria-labelledby="checkout-page-title"
      role="main">
      <h1 id="checkout-page-title" className={styles.checkoutTitle}>
        ОФОРМЛЕНИЕ ЗАКАЗА
      </h1>

      <div className={styles.checkoutLayout}>
        <CheckoutForm />
        <Suspense fallback={<div>Загрузка...</div>}>
          <CheckoutSummary />
        </Suspense>
      </div>
    </main>
  );
}
