'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/auth/session';
import { priceToKopecks } from '@/app/lib/catalog/price';
import { getPrisma } from '@/app/lib/prisma';
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

export async function updateProduct(id: number, updatedAt: string, formData: FormData) {
  await verifyAdmin();
  if (!validId(id) || typeof updatedAt !== 'string' || !(formData instanceof FormData)) {
    return { error: 'Не удалось определить товар.' };
  }

  const editedAt = new Date(updatedAt);
  if (!Number.isFinite(editedAt.getTime())) return { error: 'Обнови страницу и повтори попытку.' };

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

  try {
    const prisma = getPrisma();
    const category = await prisma.category.findUnique({ where: { key: categoryKey } });
    if (!category) return { error: 'Выбери существующую категорию.' };

    const { count } = await prisma.product.updateMany({
      where: { id, updatedAt: editedAt },
      data: { name, priceKopecks, stock, categoryKey, status, description, advantages, characteristics },
    });

    refreshProducts();
    if (!count) return { error: 'Товар изменился или был удалён. Закрой форму и открой его заново.' };
    return { message: 'Товар сохранён.' };
  } catch (error) {
    console.error('Ошибка сохранения товара:', error);
    return { error: 'Не удалось сохранить товар. Попробуй ещё раз.' };
  }
}
