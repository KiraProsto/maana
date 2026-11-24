'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/auth/session';
import { priceToKopecks } from '@/app/lib/catalog/price';
import { getPrisma } from '@/app/lib/prisma';
import { prepareProductImage, storeProductImages } from '@/app/lib/product-media';
import { maxGalleryPhotos, maxPhotoBytes, maxUploadBytes } from './product-photo-limits';
import { isProductStatus } from './product-statuses';

const maxInt = 2_147_483_647;

async function verifyAdmin() {
  const session = await verifySession();
  if (session.role !== 'admin' && session.role !== 'developer') {
    throw new Error('Недостаточно прав для изменения товаров.');
  }
}

function validId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0 && id <= maxInt;
}

function refreshProducts() {
  revalidatePath('/admin');
  revalidatePath('/(site)', 'layout');
}

export async function changeProducts(
  ids: number[],
  operation: 'category' | 'status' | 'delete',
  value?: string,
) {
  await verifyAdmin();

  if (!Array.isArray(ids) || !ids.length || ids.length > 100 || !ids.every(validId)) {
    return { error: 'Выбери товары для изменения.' };
  }

  try {
    const prisma = getPrisma();
    const where = { id: { in: [...new Set(ids)] } };
    let count: number;
    if (operation === 'delete') {
      ({ count } = await prisma.product.deleteMany({ where }));
    } else if (operation === 'status' && isProductStatus(value)) {
      ({ count } = await prisma.product.updateMany({ where, data: { status: value } }));
    } else if (operation === 'category' && typeof value === 'string' && value.length <= 100) {
      const category = await prisma.category.findUnique({ where: { key: value } });
      if (!category) return { error: 'Выбери существующую категорию.' };

      ({ count } = await prisma.product.updateMany({ where, data: { categoryKey: category.key } }));
    } else {
      return { error: 'Проверь выбранное действие.' };
    }

    refreshProducts();
    if (!count) return { error: 'Выбранные товары уже отсутствуют.' };
    return { message: operation === 'delete' ? `Удалено товаров: ${count}` : `Обновлено товаров: ${count}` };
  } catch (error) {
    console.error('Ошибка группового изменения товаров:', error);
    return { error: 'Не удалось изменить товары. Попробуй ещё раз.' };
  }
}

export async function saveProduct(id: number | null, updatedAt: string, formData: FormData) {
  await verifyAdmin();
  if ((id !== null && !validId(id)) || typeof updatedAt !== 'string' || !(formData instanceof FormData)) {
    return { error: 'Не удалось определить товар.' };
  }

  const editedAt = new Date(updatedAt);
  if (id !== null && !Number.isFinite(editedAt.getTime())) return { error: 'Обнови страницу и повтори попытку.' };

  const read = (key: string) => String(formData.get(key) ?? '').trim();
  const name = read('name');
  const stockText = read('stock');
  const stock = Number(stockText);
  const categoryKey = read('category');
  const status = read('status');
  const description = read('description');
  const advantages = read('advantages');
  const characteristics = read('characteristics');

  if (!name || name.length > 250) return { error: 'Введи название до 250 символов.' };
  if (!/^\d+$/.test(stockText) || stock > maxInt) return { error: 'Введи целый неотрицательный остаток.' };
  if (!isProductStatus(status) || !categoryKey || categoryKey.length > 100) {
    return { error: 'Выбери категорию и статус.' };
  }
  if ([description, advantages, characteristics].some((text) => text.length > 20_000)) {
    return { error: 'Каждое текстовое поле должно быть не длиннее 20 000 символов.' };
  }

  let priceKopecks: number;
  try {
    priceKopecks = priceToKopecks(read('price'), name);
  } catch {
    return { error: 'Введи цену в рублях, до двух знаков после запятой.' };
  }

  const cover = formData.get('cover');
  const newCover = cover instanceof File && cover.size > 0 ? cover : null;
  const newGallery = formData.getAll('galleryFiles');
  if (!newGallery.every((file): file is File => file instanceof File && file.size > 0)) {
    return { error: 'Проверь файлы в галерее.' };
  }

  const retained = formData.getAll('galleryPosition').map((position) =>
    typeof position === 'string' && /^\d+$/.test(position) ? Number(position) : -1,
  );
  const uploads = newCover ? [newCover, ...newGallery] : newGallery;
  if (
    retained.length + newGallery.length > maxGalleryPhotos ||
    uploads.some((file) => file.size > maxPhotoBytes) ||
    uploads.reduce((bytes, file) => bytes + file.size, 0) > maxUploadBytes
  ) {
    return { error: 'До 20 фото в галерее, до 5 МБ на фото и до 20 МБ за сохранение.' };
  }

  try {
    const prisma = getPrisma();
    const [category, existing] = await Promise.all([
      prisma.category.findUnique({ where: { key: categoryKey }, select: { key: true } }),
      id === null ? null : prisma.product.findUnique({
        where: { id },
        select: { mainImage: true, updatedAt: true, images: { select: { src: true, position: true } } },
      }),
    ]);
    if (!category) return { error: 'Выбери существующую категорию.' };
    if (id !== null && (!existing || existing.updatedAt.getTime() !== editedAt.getTime())) {
      return { error: 'Карточка уже изменилась. Открой её заново.' };
    }
    if (!newCover && !existing?.mainImage) return { error: 'Добавь главное фото.' };

    const previousPhotos = new Map(existing?.images.map(({ position, src }) => [position, src]));
    const keptPhotos = [...new Set(retained)].map((position) => previousPhotos.get(position));
    if (keptPhotos.some((src) => src === undefined)) return { error: 'Проверь список фотографий.' };

    const images: Buffer[] = [];
    try {
      for (const file of uploads) images.push(await prepareProductImage(file));
    } catch {
      return { error: 'Не удалось прочитать фото. Подойдут JPG, PNG и WebP до 40 мегапикселей.' };
    }

    const urls = await storeProductImages(images);
    const gallery = [...keptPhotos, ...urls.slice(newCover ? 1 : 0)]
      .flatMap((src, position) => src ? [{ src, position }] : []);
    const mainImage = newCover ? urls[0] : existing!.mainImage;
    const data = { name, priceKopecks, stock, categoryKey, status, description, advantages, characteristics, mainImage };

    const result = await prisma.$transaction(async (tx) => {
      if (id === null) {
        const { _max } = await tx.product.aggregate({
          where: { categoryKey },
          _max: { position: true },
        });
        return tx.product.create({
          data: { ...data, position: (_max.position ?? -1) + 1, images: { create: gallery } },
          select: { id: true },
        });
      }

      const { count } = await tx.product.updateMany({ where: { id, updatedAt: editedAt }, data });
      if (!count) return null;
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (gallery.length) {
        await tx.productImage.createMany({ data: gallery.map((photo) => ({ ...photo, productId: id })) });
      }
      return { id };
    });
    if (!result) return { error: 'Карточка уже изменилась. Открой её заново.' };

    refreshProducts();
    revalidatePath(`/admin/products/${result.id}`);
    return { id: result.id };
  } catch (error) {
    console.error('Ошибка сохранения товара:', error);
    return { error: 'Не удалось сохранить товар. Попробуй ещё раз.' };
  }
}
