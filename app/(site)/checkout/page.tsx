import styles from './checkout.module.css';
import { Metadata } from 'next';
import CheckoutForm from './components/CheckoutForm';
import CheckoutSummary from './components/CheckoutSummary';
import { Suspense } from 'react';
import { getProductSummaries } from '@/app/lib/catalog/server';
import { paymentConfig } from '@/app/lib/payments/provider';
import { usesDatabaseCatalog } from '@/app/lib/catalog/source';

export const metadata: Metadata = {
  title: 'МААНА | Оформление',
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const products = await getProductSummaries();
  const paymentUnavailable = usesDatabaseCatalog() && !paymentConfig();

  return (
    <main
      className={styles.checkout}
      aria-labelledby="checkout-page-title"
      role="main">
      <h1 id="checkout-page-title" className={styles.checkoutTitle}>
        ОФОРМЛЕНИЕ ЗАКАЗА
      </h1>

      <div className={styles.checkoutLayout}>
        <Suspense fallback={<div>Загрузка...</div>}>
          {paymentUnavailable ? (
            <p role="status">Оплата сейчас недоступна.</p>
          ) : (
            <CheckoutForm products={products} />
          )}
        </Suspense>
        <Suspense fallback={<div>Загрузка...</div>}>
          <CheckoutSummary products={products} />
        </Suspense>
      </div>
    </main>
  );
}
