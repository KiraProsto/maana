import { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './layout.module.css';
import { CartProvider } from './context/CartContext';
import { DeliveryProvider } from './context/DeliveryContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://maana.ru'),
  title: 'МААНА | Свечи и мастер‑классы',
  description:
    'Интерьерные свечи, декор и очные мастер‑классы в уютной студии.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'МААНА — интерьерные свечи и мастер‑классы',
    description: 'Авторские интерьерные свечи, декор и очные мастер‑классы.',
    url: 'https://maana.ru',
    siteName: 'МААНА',
    images: [
      {
        url: '/og-image.jpg',
        width: 630,
        height: 630,
        alt: 'МААНА — интерьерные свечи',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body className={styles.body}>
        <CartProvider>
          <DeliveryProvider>
            <Header />
            <main className={styles.main}>{children}</main>
            <Footer />
          </DeliveryProvider>
        </CartProvider>
      </body>
    </html>
  );
}
