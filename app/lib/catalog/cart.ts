import type { CartProduct, ProductSummary } from './types';

export function getCartProducts(
  products: ProductSummary[],
  cart: Record<string, number>,
  singleId?: string | null,
): CartProduct[] {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const entries = singleId
    ? [[singleId, cart[singleId] || 1] as const]
    : Object.entries(cart);

  return entries.flatMap(([id, count]) => {
    const product = productsById.get(Number(id));
    if (!product || !Number.isSafeInteger(count) || count < 1) return [];
    return [{ ...product, count }];
  });
}

export function getCartTotal(items: CartProduct[]) {
  return items.reduce((sum, item) => sum + item.priceKopecks * item.count, 0);
}
