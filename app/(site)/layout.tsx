import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import styles from '@/app/layout.module.css';
import { CartProvider } from '@/app/context/CartContext';
import { DeliveryProvider } from '@/app/context/DeliveryContext';

import { SiteSettingsProvider } from '@/app/context/SiteSettingsContext';
import { getSiteSettings } from '@/app/lib/site-settings-server';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  return (
    <SiteSettingsProvider settings={settings}>
      <CartProvider>
        <DeliveryProvider>
          <Header />
          <main className={styles.main}>{children}</main>
          <Footer settings={settings} />
        </DeliveryProvider>
      </CartProvider>
    </SiteSettingsProvider>
  );
}
