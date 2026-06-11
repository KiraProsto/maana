'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import ProductsSection from './components/ProductsSection';

interface IProduct {
  id: number;
  name: string;
  price: string;
  mainImage: string;
  description?: string;
  advantages?: string;
  characteristics?: string;
  gallery?: string[];
}

interface ICatalogContentProps {
  products: IProduct[];
  holders: IProduct[];
  sachets: IProduct[];
}

export default function CatalogContent({
  products,
  holders,
  sachets,
}: ICatalogContentProps) {
  const params = useSearchParams();
  const query = params.get('search')?.toLowerCase() || '';

  useEffect(() => {
    if (!query) return;

    const sections: { id: string; items: IProduct[] }[] = [
      { id: 'interior', items: products },
      { id: 'holders', items: holders },
      { id: 'sachets', items: sachets },
    ];

    const match = sections.find((s) =>
      s.items.some((p) => p.name.toLowerCase().includes(query)),
    );

    if (match) {
      const el = document.getElementById(match.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [query, products, holders, sachets]);

  return (
    <>
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
    </>
  );
}
