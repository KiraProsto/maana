import { readProductMedia } from '@/app/lib/product-media';

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const media = await readProductMedia(file);
  if (!media) return new Response(null, { status: 404 });

  const video = file.endsWith('.mp4');
  const headers = new Headers({
    'Content-Type': video ? 'video/mp4' : 'image/webp',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  const bytes = new Uint8Array(media);

  if (video) {
    headers.set('Accept-Ranges', 'bytes');
    const range = request.headers.get('range');
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1] ? Number(match[1]) : Math.max(0, bytes.length - Number(match?.[2]));
      const end = match?.[1] && match[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;

      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || start > end) {
        headers.set('Content-Range', `bytes */${bytes.length}`);
        return new Response(null, { status: 416, headers });
      }
      headers.set('Content-Range', `bytes ${start}-${end}/${bytes.length}`);
      headers.set('Content-Length', String(end - start + 1));
      return new Response(bytes.subarray(start, end + 1), { status: 206, headers });
    }
  }

  headers.set('Content-Length', String(bytes.length));
  return new Response(bytes, { headers });
}
