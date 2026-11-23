import Image from 'next/image';
import styles from '../checkout.module.css';

export interface ICheckoutItem {
  id: number;
  name: string;
  price: number;
  mainImage: string;
  count: number;
}

export default function CheckoutItem({ item }: { item: ICheckoutItem }) {
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
          {item.price * item.count} руб
        </div>
      </div>
    </div>
  );
}
