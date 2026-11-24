'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import ProductsSection from './components/ProductsSection';

import type { CatalogProduct } from '@/app/lib/catalog/types';

const categories = [
  { id: 'interior', title: 'ИНТЕРЬЕРНЫЕ СВЕЧИ' },
  { id: 'holders', title: 'АРОМАТИЧЕСКИЕ СВЕЧИ' },
  { id: 'sachets', title: 'АРОМАСАШЕ' },
];

export default function CatalogContent({ products }: { products: CatalogProduct[] }) {
  const params = useSearchParams();
  const query = params.get('search')?.toLowerCase() || '';

  useEffect(() => {
    if (!query) return;

    const match = categories.find(({ id }) =>
      products.some((p) => p.categoryKey === id && p.name.toLowerCase().includes(query)),
    );

    if (match) {
      const el = document.getElementById(match.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [query, products]);

  return (
    <>
      {categories.map(({ id, title }) => (
        <ProductsSection
          key={id}
          id={id}
          title={title}
          products={products.filter((product) => product.categoryKey === id)}
        />
      ))}
    </>
  );
}
