import { Metadata } from 'next';
import Hero from './components/main/Hero';
import About from './components/main/About';
import Hits from './components/main/Hits';

export const metadata: Metadata = {
  title: 'МААНА | Главная',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Hits />
    </>
  );
}
