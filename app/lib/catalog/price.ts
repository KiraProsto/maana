const rubles = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

export function formatRubles(kopecks: number) {
  return `${rubles.format(kopecks / 100)} руб`;
}

export function priceToKopecks(price: string, label: string) {
  const match = price.trim().match(/^(\d+(?:[ \u00a0\u202f]\d{3})*)(?:[,.](\d{1,2}))?\s*(?:руб\.?|₽)?$/iu);
  if (!match) {
    throw new Error(`Некорректная цена для ${label}: ${price}`);
  }

  const kopecks =
    Number(match[1].replace(/\s/g, '')) * 100 +
    Number((match[2] ?? '').padEnd(2, '0'));

  if (!Number.isSafeInteger(kopecks) || kopecks > 2_147_483_647) {
    throw new Error(`Цена вне допустимого диапазона для ${label}: ${price}`);
  }

  return kopecks;
}
