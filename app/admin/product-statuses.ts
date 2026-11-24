export const productStatuses = {
  PUBLISHED: 'Опубликован',
  DRAFT: 'Черновик',
  HIDDEN: 'Скрыт',
} as const;

export function isProductStatus(value: unknown): value is keyof typeof productStatuses {
  return typeof value === 'string' && Object.hasOwn(productStatuses, value);
}
