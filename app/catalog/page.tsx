import { Metadata } from 'next';
import CatalogSection from './components/CatalogSection';
import MasterSection from './components/MasterSection';

export const metadata: Metadata = {
  title: 'МААНА | Каталог',
};

export default function HomePage() {
  return (
    <>
      <CatalogSection />
      <MasterSection />
    </>
  );
}
