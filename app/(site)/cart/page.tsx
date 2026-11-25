import { Metadata } from 'next';
import styles from './CartPage.module.css';
import CartLayout from './components/CartLayout';
import { getProductSummaries } from '@/app/lib/catalog/server';

export const metadata: Metadata = {
  title: 'МААНА | Корзина',
};

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const products = await getProductSummaries();

  return (
    <main className={styles.cartPage}>
      <div className={styles.cartTitleWrap}>
        <h2 className={styles.cartTitle}>КОРЗИНА</h2>
      </div>

      <CartLayout products={products} />
    </main>
  );
}
