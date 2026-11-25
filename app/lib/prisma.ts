import 'server-only';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/app/generated/prisma/client';

const globalPrisma = globalThis as typeof globalThis & { maanaPrisma?: PrismaClient };

export function getPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Укажите DATABASE_URL.');

  return (globalPrisma.maanaPrisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  }));
}
