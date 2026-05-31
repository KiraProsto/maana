import { Metadata } from 'next';
import Hero from './components/main/Hero';

export const metadata: Metadata = {
  title: 'МААНА | Главная',
};

export default function HomePage() {
  return (
    <>
      <Hero />
    </>
  );
}
