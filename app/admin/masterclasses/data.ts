import 'server-only';

import { getPrisma } from '@/app/lib/prisma';

export const masterClassOrder = [{ position: 'asc' }, { id: 'asc' }] as const;

export function getAdminMasterClasses() {
  return getPrisma().masterClass.findMany({
    where: { deletionToken: null },
    orderBy: [...masterClassOrder],
    select: {
      id: true, title: true, age: true, duration: true,
      mainImage: true, status: true, priceKopecks: true, updatedAt: true,
    },
  });
}

export function getEditableMasterClass(id: number) {
  return getPrisma().masterClass.findUnique({
    where: { id, deletionToken: null },
    select: {
      id: true, title: true, age: true, duration: true, description: true,
      mainImage: true, status: true, priceKopecks: true, updatedAt: true,
      media: { orderBy: { position: 'asc' }, select: { kind: true, src: true, position: true } },
    },
  });
}

export type AdminMasterClass = Awaited<ReturnType<typeof getAdminMasterClasses>>[number];
export type EditableMasterClass = NonNullable<Awaited<ReturnType<typeof getEditableMasterClass>>>;
