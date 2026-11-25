import { readFile } from 'node:fs/promises';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '../app/generated/prisma/client';
import { holders } from '../app/data/holders';
import { masterClasses } from '../app/data/masterClasses';
import { products } from '../app/data/products';
import { sachets } from '../app/data/sachets';
import { priceToKopecks } from '../app/lib/catalog/price';

const maxInt = 2_147_483_647;
const categories = [
  { key: 'interior', title: 'Интерьерные свечи', items: products },
  { key: 'holders', title: 'Ароматические свечи', items: holders },
  { key: 'sachets', title: 'Аромасаше', items: sachets },
];

interface LegacyProduct {
  id: number;
  name: string;
  price: string;
  mainImage: string;
  description?: string;
  advantages?: string;
  characteristics?: string;
  gallery?: string[];
}

async function prepareCatalog() {
  const inventory: unknown = JSON.parse(
    await readFile('data/inventory.json', 'utf-8'),
  );
  if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) {
    throw new Error('Некорректный формат data/inventory.json');
  }

  const stockById = new Map(Object.entries(inventory));
  const productIds = new Set<number>();
  const productRows = categories.flatMap(({ key, items }) =>
    items.map((item: LegacyProduct, position) => {
      if (!Number.isInteger(item.id) || item.id < 1 || item.id >= maxInt || productIds.has(item.id)) {
        throw new Error(`Некорректный или повторяющийся ID товара: ${item.id}`);
      }
      productIds.add(item.id);

      const stock = stockById.get(String(item.id));
      if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0 || stock > maxInt) {
        throw new Error(`Отсутствует корректный остаток для товара ${item.id}`);
      }

      return {
        id: item.id,
        categoryKey: key,
        name: item.name,
        priceKopecks: priceToKopecks(item.price, `товара ${item.id}`),
        stock,
        mainImage: item.mainImage,
        description: item.description ?? '',
        advantages: item.advantages ?? '',
        characteristics: item.characteristics ?? '',
        status: 'PUBLISHED' as const,
        position,
        images: (item.gallery ?? []).map((src, position) => ({ src, position })),
      };
    }),
  );

  const unknownIds = [...stockById.keys()].filter((id) => !productIds.has(Number(id)) || String(Number(id)) !== id);
  if (unknownIds.length) {
    throw new Error(`Остатки без соответствующего товара: ${unknownIds.join(', ')}`);
  }

  const masterKeys = new Set<string>();
  const masterRows = masterClasses.map((item, position) => {
    if (!item.mainImage || masterKeys.has(item.mainImage)) {
      throw new Error(`Отсутствует или повторяется обложка мастер-класса: ${item.title}`);
    }
    masterKeys.add(item.mainImage);

    return {
      legacyKey: item.mainImage,
      title: item.title,
      description: item.description,
      age: item.age,
      duration: item.duration,
      priceKopecks: item.price?.trim() ? priceToKopecks(item.price, item.title) : null,
      mainImage: item.mainImage,
      status: 'PUBLISHED' as const,
      position,
      media: (item.images ?? []).map((src, position) => ({
        src,
        position,
        kind: /\.mp4$/i.test(src) ? 'VIDEO' as const : 'IMAGE' as const,
      })),
    };
  });

  return { productRows, masterRows };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && args[0] !== '--apply')) {
    throw new Error('Использование: node --import tsx scripts/import-catalog.ts [--apply]');
  }

  const { productRows, masterRows } = await prepareCatalog();
  console.table(productRows.map(({ id, name, categoryKey, priceKopecks, stock }) => ({
    id, name, categoryKey, priceKopecks, stock,
  })));
  console.table(masterRows.map(({ title, priceKopecks, media }) => ({
    title, priceKopecks, media: media.length,
  })));

  if (args[0] !== '--apply') {
    console.log('Проверка исходных данных завершена. Для записи в БД добавьте --apply.');
    return;
  }

  loadEnvConfig(process.cwd(), true);
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Укажите DATABASE_URL для тестовой базы.');
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Сохраняем исходные ID и синхронизируем счётчик перед созданием новых товаров.
      await tx.$executeRaw`LOCK TABLE "Product" IN SHARE ROW EXCLUSIVE MODE`;

      await tx.category.createMany({
        data: categories.map(({ key, title }, position) => ({ key, title, position })),
        skipDuplicates: true,
      });

      let importedProducts = 0;
      for (const { images, ...product } of productRows) {
        const created = await tx.product.createMany({ data: [product], skipDuplicates: true });
        if (created.count) {
          await tx.productImage.createMany({
            data: images.map((image) => ({ ...image, productId: product.id })),
          });
          importedProducts += 1;
        }
      }

      if (importedProducts) {
        await tx.$queryRaw`
          SELECT setval(
            pg_get_serial_sequence('"Product"', 'id'),
            GREATEST((SELECT MAX("id") FROM "Product"), last_value)
          )
          FROM "Product_id_seq"
        `;
      }

      let importedMasters = 0;
      for (const { media, ...master } of masterRows) {
        const [created] = await tx.masterClass.createManyAndReturn({
          data: [master],
          skipDuplicates: true,
          select: { id: true },
        });
        if (created) {
          await tx.masterClassMedia.createMany({
            data: media.map((item) => ({ ...item, masterClassId: created.id })),
          });
          importedMasters += 1;
        }
      }

      return { importedProducts, importedMasters };
    }, { timeout: 30_000 });

    console.log(`Товары: добавлено ${result.importedProducts}, уже было ${productRows.length - result.importedProducts}.`);
    console.log(`Мастер-классы: добавлено ${result.importedMasters}, уже было ${masterRows.length - result.importedMasters}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
