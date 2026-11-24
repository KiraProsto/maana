import Image from 'next/image';
import styles from '../checkout.module.css';

import { formatRubles } from '@/app/lib/catalog/price';
import type { CartProduct } from '@/app/lib/catalog/types';

export default function CheckoutItem({ item }: { item: CartProduct }) {
  return (
    <div className={styles.checkoutItem}>
      <Image
        src={item.mainImage}
        alt={item.name}
        width={90}
        height={90}
        className={styles.checkoutItemImg}
      />

      <div className={styles.checkoutItemInfo}>
        <div className={styles.checkoutItemName}>{item.name}</div>
        <div className={styles.checkoutItemCount}>{item.count} шт</div>
        <div className={styles.checkoutItemPrice}>
          {formatRubles(item.priceKopecks * item.count)}
        </div>
      </div>
    </div>
  );
}
