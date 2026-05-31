import { Metadata } from 'next';
import CatalogSection from './components/CatalogSection';
import MasterSection from './components/MasterSection';
import ProductsSection from './components/ProductsSection';

import { products } from '@/app/data/products';
import { holders } from '@/app/data/holders';
import { sachets } from '@/app/data/sachets';

interface IProductData {
  id: number;
  name: string;
  price: string;
  mainImage: string;
}

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
        products={products.map((p: IProductData) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.mainImage,
        }))}
      />

      <ProductsSection
        id="holders"
        title="АРОМАТИЧЕСКИЕ СВЕЧИ"
        products={holders.map((p: IProductData) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.mainImage,
        }))}
      />

      <ProductsSection
        id="sachets"
        title="АРОМАСАШЕ"
        products={sachets.map((p: IProductData) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.mainImage,
        }))}
      />
    </>
  );
}
