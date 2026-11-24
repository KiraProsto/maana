import { Metadata } from 'next';
import CatalogSection from './components/CatalogSection';
import MasterSection from './components/MasterSection';
import ToTopButton from './components/ToTopButton';
import CatalogContent from './CatalogContent';

import { getCatalogProducts, getMasterClasses } from '@/app/lib/catalog/server';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'МААНА | Каталог',
};

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const [products, masterClasses] = await Promise.all([
    getCatalogProducts(),
    getMasterClasses(),
  ]);
  return (
    <>
      <CatalogSection />
      <MasterSection masterClasses={masterClasses} />

      <Suspense fallback={null}>
        <CatalogContent products={products} />
      </Suspense>

      <ToTopButton />
    </>
  );
}
