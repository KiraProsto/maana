import 'server-only';

import { readFile } from 'node:fs/promises';
import { getPrisma } from '@/app/lib/prisma';
import { holders } from '@/app/data/holders';
import { masterClasses } from '@/app/data/masterClasses';
import { products } from '@/app/data/products';
import { sachets } from '@/app/data/sachets';
import { priceToKopecks } from './price';
import { usesDatabaseCatalog } from './source';
import type { CatalogMasterClass, CatalogProduct, ProductSummary } from './types';

const published = { status: 'PUBLISHED' as const };
const publishedProduct = { ...published, deletionToken: null };
const productSummaryFields = {
  id: true,
  name: true,
  mainImage: true,
  priceKopecks: true,
} as const;

const fileCategories = [
  { key: 'interior', items: products },
  { key: 'holders', items: holders },
  { key: 'sachets', items: sachets },
];

async function readLegacyStock(): Promise<Record<string, number>> {
  try {
    return JSON.parse(await readFile('data/inventory.json', 'utf-8'));
  } catch {
    return {};
  }
}

function toProductSummary(item: { id: number; name: string; mainImage: string; price: string }) {
  return {
    id: item.id,
    name: item.name,
    mainImage: item.mainImage,
    priceKopecks: priceToKopecks(item.price, item.name),
  };
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!usesDatabaseCatalog()) {
    const stockById = await readLegacyStock();
    return fileCategories.flatMap(({ key, items }) =>
      items.map((item) => ({
        ...toProductSummary(item),
        categoryKey: key,
        stock: stockById[item.id] ?? Number(item.count ?? 1),
        description: item.description ?? '',
        advantages: item.advantages ?? '',
        characteristics: item.characteristics ?? '',
        gallery: item.gallery ?? [],
      })),
    );
  }

  const rows = await getPrisma().product.findMany({
    where: publishedProduct,
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
    select: {
      ...productSummaryFields,
      categoryKey: true,
      stock: true,
      description: true,
      advantages: true,
      characteristics: true,
      images: { orderBy: { position: 'asc' }, select: { src: true } },
    },
  });

  return rows.map(({ images, ...product }) => ({
    ...product,
    gallery: images.map(({ src }) => src),
  }));
}

export async function getProductSummaries(): Promise<ProductSummary[]> {
  if (!usesDatabaseCatalog()) {
    return fileCategories.flatMap(({ items }) => items.map(toProductSummary));
  }

  return getPrisma().product.findMany({
    where: publishedProduct,
    select: productSummaryFields,
  });
}

export async function getHits(): Promise<ProductSummary[]> {
  if (!usesDatabaseCatalog()) return products.slice(0, 3).map(toProductSummary);

  return getPrisma().product.findMany({
    where: { ...publishedProduct, categoryKey: 'interior' },
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
    take: 3,
    select: productSummaryFields,
  });
}

export async function getMasterClasses(): Promise<CatalogMasterClass[]> {
  if (!usesDatabaseCatalog()) {
    return masterClasses.map(({ images, price, ...item }, index) => ({
      ...item,
      id: index + 1,
      priceKopecks: price ? priceToKopecks(price, item.title) : null,
      media: images.map((src) => ({ src, type: /\.mp4$/i.test(src) ? 'video' : 'image' })),
    }));
  }

  const rows = await getPrisma().masterClass.findMany({
    where: { ...published, deletionToken: null },
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      title: true,
      description: true,
      age: true,
      duration: true,
      priceKopecks: true,
      mainImage: true,
      media: { orderBy: { position: 'asc' }, select: { kind: true, src: true } },
    },
  });

  return rows.map(({ media, ...item }) => ({
    ...item,
    media: media.map(({ kind, src }) => ({ src, type: kind === 'VIDEO' ? 'video' : 'image' })),
  }));
}
