import { Metadata } from 'next';
import CatalogSection from './components/CatalogSection';
import MasterSection from './components/MasterSection';
import ToTopButton from './components/ToTopButton';
import CatalogContent from './CatalogContent';

import { products } from '@/app/data/products';
import { holders } from '@/app/data/holders';
import { sachets } from '@/app/data/sachets';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'МААНА | Каталог',
};

export default function HomePage() {
  return (
    <>
      <CatalogSection />
      <MasterSection />

      <Suspense fallback={null}>
        <CatalogContent
          products={products}
          holders={holders}
          sachets={sachets}
        />
      </Suspense>

      <ToTopButton />
    </>
  );
}
