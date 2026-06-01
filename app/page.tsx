import { Metadata } from 'next';
import Hero from './components/main/Hero';
import About from './components/main/About';
import Hits from './components/main/Hits';
import Composition from './components/main/Composition';
import Delivery from './components/main/Delivery';
import Contacts from './components/main/Contacts';

export const metadata: Metadata = {
  title: 'МААНА | Главная',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Hits />
      <Composition />
      <Delivery />
      <Contacts />
    </>
  );
}
