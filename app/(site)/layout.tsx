import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import styles from '@/app/layout.module.css';
import { CartProvider } from '@/app/context/CartContext';
import { DeliveryProvider } from '@/app/context/DeliveryContext';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <DeliveryProvider>
        <Header />
        <main className={styles.main}>{children}</main>
        <Footer />
      </DeliveryProvider>
    </CartProvider>
  );
}
