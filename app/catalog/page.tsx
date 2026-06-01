import { Metadata } from 'next';
import CatalogSection from './components/CatalogSection';
import MasterSection from './components/MasterSection';
import ProductsSection from './components/ProductsSection';

import { products } from '@/app/data/products';
import { holders } from '@/app/data/holders';
import { sachets } from '@/app/data/sachets';
import ToTopButton from './components/ToTopButton';

export const metadata: Metadata = {
  title: 'МААНА | Каталог',
};

export default function HomePage() {
  return (
    <>
      <CatalogSection />
      <MasterSection />

      <ProductsSection
        id="interior"
        title="ИНТЕРЬЕРНЫЕ СВЕЧИ"
        products={products}
      />

      <ProductsSection
        id="holders"
        title="АРОМАТИЧЕСКИЕ СВЕЧИ"
        products={holders}
      />

      <ProductsSection id="sachets" title="АРОМАСАШЕ" products={sachets} />

      <ToTopButton />
    </>
  );
}
