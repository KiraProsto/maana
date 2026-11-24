import { readProductMedia } from '@/app/lib/product-media';

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const image = await readProductMedia(file);
  if (!image) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
