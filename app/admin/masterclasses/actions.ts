'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/auth/session';
import { priceToKopecks } from '@/app/lib/catalog/price';
import { getPrisma } from '@/app/lib/prisma';
import { prepareProductImage, storeUploadedMedia } from '@/app/lib/product-media';
import { isProductStatus } from '../product-statuses';
import { maxPhotoBytes, maxUploadBytes } from '../product-photo-limits';
import { getEditableMasterClass } from './data';
import { maxMasterClassMedia, maxVideoBytes } from './media-limits';

async function verifyAdmin() {
  const session = await verifySession();
  if (session.role !== 'admin' && session.role !== 'developer') {
    throw new Error('Недостаточно прав для изменения мастер-классов.');
  }
}

function isId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0 && id <= 2_147_483_647;
}

function refreshMasterClasses() {
  revalidatePath('/admin/masterclasses');
  revalidatePath('/admin/masterclasses/[masterClassId]', 'page');
  revalidatePath('/catalog');
}

function validFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

async function prepareVideo(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const boxSize = bytes.length >= 16 ? bytes.readUInt32BE(0) : 0;
  if (boxSize < 16 || boxSize > bytes.length || bytes.toString('ascii', 4, 8) !== 'ftyp' ||
      bytes.toString('ascii', 8, 12) === 'qt  ') {
    throw new Error('Unsupported video format');
  }

  let hasMovie = false;
  let hasMedia = false;
  for (let offset = boxSize; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32BE(offset) || bytes.length - offset;
    if (size < 8 || offset + size > bytes.length) break;
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    hasMovie ||= type === 'moov';
    hasMedia ||= type === 'mdat';
    offset += size;
  }
  if (!hasMovie || !hasMedia) throw new Error('Incomplete MP4');
  return bytes;
}

export async function saveMasterClass(id: number | null, version: string, data: FormData) {
  await verifyAdmin();
  if ((id !== null && !isId(id)) || typeof version !== 'string' || !(data instanceof FormData)) {
    return { error: 'Не удалось определить мастер-класс.' };
  }

  const read = (key: string) => {
    const value = data.get(key);
    return typeof value === 'string' ? value.trim() : '';
  };
  const title = read('title');
  const age = read('age');
  const duration = read('duration');
  const description = read('description');
  const status = read('status');
  if (!title || title.length > 250 || !age || age.length > 30 ||
      !duration || duration.length > 80 || description.length > 20_000 || !isProductStatus(status)) {
    return { error: 'Проверь название, возраст, длительность, описание и статус.' };
  }

  let priceKopecks: number | null = null;
  try {
    const price = read('price');
    if (price) priceKopecks = priceToKopecks(price, title);
  } catch {
    return { error: 'Введи цену в рублях, до двух знаков после запятой.' };
  }

  const order = data.getAll('mediaOrder');
  const cover = data.get('cover');
  if (order.length > maxMasterClassMedia ||
      (cover !== null && (!validFile(cover) || cover.size > maxPhotoBytes))) {
    return { error: 'Проверь обложку и количество файлов в галерее.' };
  }

  try {
    const prisma = getPrisma();
    const previous = id === null ? null : await getEditableMasterClass(id);
    if (id !== null && (!previous || previous.updatedAt.toISOString() !== version)) {
      return { error: 'Карточка уже изменилась. Открой её заново.' };
    }
    if (!cover && !previous?.mainImage) return { error: 'Добавь главное фото.' };

    const previousMedia = new Map(previous?.media.map((item) => [item.position, item]));
    const files: { bytes: Buffer; extension: 'webp' | 'mp4' }[] = [];
    const gallery: { position: number; kind: 'IMAGE' | 'VIDEO'; src?: string; fileIndex?: number }[] = [];
    let totalBytes = validFile(cover) ? cover.size : 0;

    try {
      if (validFile(cover)) files.push({ bytes: await prepareProductImage(cover), extension: 'webp' });
      const used = new Set<string>();
      for (const [position, entry] of order.entries()) {
        if (typeof entry !== 'string' || used.has(entry)) throw new Error('Invalid order');
        used.add(entry);
        const [kind, index] = entry.split(':');
        if (!/^(?:old|new):(?:0|[1-9]\d{0,4})$/.test(entry)) throw new Error('Invalid order');
        if (kind === 'old') {
          const item = previousMedia.get(Number(index));
          if (!item) throw new Error('Missing media');
          gallery.push({ position, kind: item.kind, src: item.src });
          continue;
        }

        const file = data.get(`media-${index}`);
        if (!validFile(file)) throw new Error('Invalid file');
        const video = file.type === 'video/mp4' || /\.mp4$/i.test(file.name);
        totalBytes += file.size;
        if (file.size > (video ? maxVideoBytes : maxPhotoBytes) || totalBytes > maxUploadBytes) {
          return { error: 'До 5 МБ на фото и до 20 МБ за одно сохранение.' };
        }
        gallery.push({ position, kind: video ? 'VIDEO' : 'IMAGE', fileIndex: files.length });
        files.push(video
          ? { bytes: await prepareVideo(file), extension: 'mp4' }
          : { bytes: await prepareProductImage(file), extension: 'webp' });
      }
    } catch {
      return { error: 'Проверь файлы. Подойдут JPG, PNG, WebP и MP4.' };
    }

    const urls = await storeUploadedMedia(files);
    const media = gallery.map(({ position, kind, src, fileIndex }) => ({
      position, kind, src: src ?? urls[fileIndex!],
    }));
    const fields = {
      title, age, duration, description, status, priceKopecks,
      mainImage: cover ? urls[0] : previous!.mainImage,
    };

    const saved = await prisma.$transaction(async (tx) => {
      if (id === null) {
        const { _max } = await tx.masterClass.aggregate({ _max: { position: true } });
        await tx.masterClass.create({
          data: { ...fields, position: (_max.position ?? -1) + 1, media: { create: media } },
        });
        return true;
      }

      const { count } = await tx.masterClass.updateMany({
        where: { id, updatedAt: previous!.updatedAt, deletionToken: null },
        data: fields,
      });
      if (!count) return false;
      await tx.masterClassMedia.deleteMany({ where: { masterClassId: id } });
      if (media.length) {
        await tx.masterClassMedia.createMany({ data: media.map((item) => ({ ...item, masterClassId: id })) });
      }
      return true;
    });

    if (!saved) return { error: 'Карточка уже изменилась. Открой её заново.' };
    refreshMasterClasses();
    return { saved: true };
  } catch (error) {
    console.error('Ошибка сохранения мастер-класса:', error);
    return { error: 'Не удалось сохранить мастер-класс. Попробуй ещё раз.' };
  }
}

export async function changeMasterClass(
  id: number, version: string, action: 'hide' | 'publish' | 'delete',
) {
  await verifyAdmin();
  if (!isId(id) || typeof version !== 'string' || !['hide', 'publish', 'delete'].includes(action)) {
    return { error: 'Проверь выбранное действие.' };
  }
  const updatedAt = new Date(version);
  if (!Number.isFinite(updatedAt.getTime())) return { error: 'Обнови страницу.' };

  try {
    const deletionToken = action === 'delete' ? randomUUID() : undefined;
    const { count } = await getPrisma().masterClass.updateMany({
      where: { id, updatedAt, deletionToken: null },
      data: deletionToken ? { deletionToken } : { status: action === 'hide' ? 'HIDDEN' : 'PUBLISHED' },
    });

    if (!count) return { error: 'Карточка уже изменилась. Обнови страницу.' };
    refreshMasterClasses();
    return { deletionToken };
  } catch (error) {
    console.error('Ошибка изменения мастер-класса:', error);
    return { error: 'Не удалось выполнить действие. Попробуй ещё раз.' };
  }
}

export async function restoreMasterClass(token: string) {
  await verifyAdmin();
  if (typeof token !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(token)) {
    return { error: 'Не удалось определить мастер-класс.' };
  }

  try {
    await getPrisma().masterClass.updateMany({
      where: { deletionToken: token },
      data: { deletionToken: null },
    });
    refreshMasterClasses();
    return { restored: true };
  } catch (error) {
    console.error('Ошибка восстановления мастер-класса:', error);
    return { error: 'Не удалось вернуть мастер-класс. Попробуй ещё раз.' };
  }
}
