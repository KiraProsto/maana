import { Metadata } from 'next';
import CatalogSection from '../components/catalog/CatalogSection';

export const metadata: Metadata = {
  title: 'МААНА | Каталог',
};

export default function HomePage() {
  return (
    <>
      <CatalogSection />
    </>
  );
}
