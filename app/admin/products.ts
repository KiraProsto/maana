import 'server-only';

import { getPrisma } from '@/app/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';

import { isProductStatus } from './product-statuses';

export const productPageSize = 10;

interface ProductFilters {
  query: string;
  category: string;
  status: string;
  page: number;
}

export async function getAdminProducts({ query, category, status, page }: ProductFilters) {
  const prisma = getPrisma();
  const productId = /^[1-9]\d{0,9}$/.test(query) ? Number(query) : 0;
  const where: Prisma.ProductWhereInput = {
    ...(category && { categoryKey: category }),
    ...(status === 'OUT_OF_STOCK'
      ? { stock: 0 }
      : isProductStatus(status)
        ? { status }
        : {}),
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        ...(productId && productId <= 2_147_483_647 ? [{ id: productId }] : []),
      ],
    }),
  };

  return prisma.$transaction(async (tx) => {
    const [total, categories] = await Promise.all([
      tx.product.count({ where }),
      tx.category.findMany({
        orderBy: [{ position: 'asc' }, { key: 'asc' }],
        select: { key: true, title: true },
      }),
    ]);
    const pageCount = Math.max(1, Math.ceil(total / productPageSize));
    const currentPage = Math.min(page, pageCount);
    const products = await tx.product.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      skip: (currentPage - 1) * productPageSize,
      take: productPageSize,
      select: {
        id: true,
        name: true,
        mainImage: true,
        priceKopecks: true,
        stock: true,
        status: true,
        updatedAt: true,
        category: { select: { title: true } },
        _count: { select: { images: true } },
      },
    });

    return { products, categories, total, pageCount, currentPage };
  }, { isolationLevel: 'RepeatableRead' });
}

export type AdminProduct = Awaited<ReturnType<typeof getAdminProducts>>['products'][number];

export function getEditableProduct(id: number) {
  return getPrisma().product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: 'asc' }, select: { src: true, position: true } },
    },
  });
}

export function getProductCategories() {
  return getPrisma().category.findMany({
    orderBy: [{ position: 'asc' }, { key: 'asc' }],
    select: { key: true, title: true },
  });
}

export type EditableProduct = NonNullable<Awaited<ReturnType<typeof getEditableProduct>>>;
