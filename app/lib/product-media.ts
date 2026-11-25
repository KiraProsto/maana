import 'server-only';

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { deleteMedia, getMediaStorage, putMedia } from './media-s3';

export const filenamePattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(?:webp|mp4)$/;

function uploadDirectory() {
  return resolve(process.env.PRODUCT_UPLOAD_DIR || 'data/product-uploads');
}

export async function readProductMedia(filename: string) {
  if (!filenamePattern.test(filename)) return null;

  try {
    return await readFile(join(uploadDirectory(), filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function prepareProductImage(file: File) {
  const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 });
  const { format } = await image.metadata();
  if (format !== 'jpeg' && format !== 'png' && format !== 'webp') {
    throw new Error('Unsupported image format');
  }

  return image.rotate()
    .resize(1800, 1800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();
}

export function storeProductImages(images: Buffer[]) {
  return storeUploadedMedia(images.map((bytes) => ({ bytes, extension: 'webp' })));
}

export async function storeUploadedMedia(files: { bytes: Buffer; extension: 'webp' | 'mp4' }[]) {
  if (!files.length) return [];

  const directory = uploadDirectory();
  const storage = getMediaStorage();
  if (!storage) await mkdir(directory, { recursive: true });
  const filenames: string[] = [];

  try {
    for (const { bytes, extension } of files) {
      const filename = `${randomUUID()}.${extension}`;
      if (storage) await putMedia(storage, filename, bytes);
      else await writeFile(join(directory, filename), bytes, { flag: 'wx' });
      filenames.push(filename);
    }
  } catch (error) {
    await Promise.allSettled(filenames.map((filename) =>
      storage ? deleteMedia(storage, filename) : unlink(join(directory, filename)),
    ));
    throw error;
  }

  return filenames.map((filename) => `/product-media/${filename}`);
}
