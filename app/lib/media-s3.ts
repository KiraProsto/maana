import 'server-only';

import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

let storage: { client: S3Client; bucket: string } | undefined;

export function getMediaStorage() {
  if (storage) return storage;
  const {
    MEDIA_S3_BUCKET: bucket, MEDIA_S3_ENDPOINT: endpoint, MEDIA_S3_REGION: region,
    MEDIA_S3_ACCESS_KEY: accessKeyId, MEDIA_S3_SECRET_KEY: secretAccessKey,
  } = process.env;
  if (![bucket, endpoint, region, accessKeyId, secretAccessKey].some(Boolean)) return null;
  if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('Не заполнены все переменные MEDIA_S3.');
  }

  storage = {
    bucket,
    client: new S3Client({
      endpoint, region, credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    }),
  };
  return storage;
}

function object(bucket: string, filename: string) {
  return { Bucket: bucket, Key: `product-media/${filename}` };
}

export async function putMedia(storage: NonNullable<ReturnType<typeof getMediaStorage>>, filename: string, bytes: Buffer) {
  await storage.client.send(new PutObjectCommand({
    ...object(storage.bucket, filename), Body: bytes,
    ContentType: filename.endsWith('.mp4') ? 'video/mp4' : 'image/webp',
  }));
}

export async function deleteMedia(storage: NonNullable<ReturnType<typeof getMediaStorage>>, filename: string) {
  await storage.client.send(new DeleteObjectCommand(object(storage.bucket, filename)));
}

export async function readMediaFromS3(filename: string, range: string | null, headers: Headers) {
  const storage = getMediaStorage();
  if (!storage) return null;
  const params = object(storage.bucket, filename);

  try {
    let normalizedRange: string | undefined;
    if (range) {
      const head = await storage.client.send(new HeadObjectCommand(params));
      const size = head.ContentLength ?? 0;
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const suffix = Number(match?.[2]);
      const start = match?.[1] ? Number(match[1]) : Math.max(0, size - suffix);
      const end = match?.[1] && match[2] ? Math.min(suffix, size - 1) : size - 1;
      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || start > end) {
        headers.set('Content-Range', `bytes */${size}`);
        return new Response(null, { status: 416, headers });
      }
      normalizedRange = `bytes=${start}-${end}`;
    }

    const media = await storage.client.send(new GetObjectCommand({ ...params, Range: normalizedRange }));
    if (!media.Body) throw new Error('S3 вернул пустой ответ.');
    if (media.ContentLength !== undefined) headers.set('Content-Length', String(media.ContentLength));
    if (media.ContentRange) headers.set('Content-Range', media.ContentRange);
    return new Response(media.Body.transformToWebStream(), {
      status: media.ContentRange ? 206 : 200, headers,
    });
  } catch (error) {
    const failure = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (failure.name !== 'NoSuchBucket' && failure.$metadata?.httpStatusCode === 404) return null;
    throw error;
  }
}
