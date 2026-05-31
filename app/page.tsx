import { Metadata } from 'next';
import Hero from './components/main/Hero';
import About from './components/main/About';

export const metadata: Metadata = {
  title: 'МААНА | Главная',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
    </>
  );
}
