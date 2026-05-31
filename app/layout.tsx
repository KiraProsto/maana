import { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './layout.module.css';

export const metadata: Metadata = {
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
    <html lang="ru">
      <body className={styles.body}>
        <Header />
        <main className={styles.main}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
