export function estimateWeight(quantity: number) {
  return Math.max(300, quantity * 300);
}

export function marketplaceCost(delivery: 'WB' | 'OZON', weight: number) {
  if (delivery === 'OZON' || weight <= 500) return 249;
  if (weight <= 1000) return 380;
  if (weight <= 2000) return 480;
  return 500;
}
