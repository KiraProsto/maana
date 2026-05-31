'use client';

import Image from 'next/image';
import styles from './Delivery.module.css';

export default function Delivery() {
  return (
    <section className={styles.delivery} id="delivery">
      <h2 className={styles.deliveryTitle}>ДОСТАВКА И ОПЛАТА</h2>

      <div className={styles.deliverySteps}>
        {/* ШАГ 1 */}
        <div className={`${styles.deliveryStep} ${styles.step1}`}>
          <Image
            src="/icons/step1.png"
            alt=""
            width={150}
            height={150}
            className={styles.deliveryIcon}
          />
          <p className={styles.deliveryText}>
            Выберите товар <br /> и оформите заказ
          </p>
        </div>

        <Image
          src="/icons/arrow.svg"
          alt=""
          width={120}
          height={120}
          className={`${styles.deliveryArrow} ${styles.arrow1}`}
        />

        {/* ШАГ 2 */}
        <div className={`${styles.deliveryStep} ${styles.step2}`}>
          <Image
            src="/icons/step2.png"
            alt=""
            width={150}
            height={150}
            className={styles.deliveryIcon}
          />
          <p className={styles.deliveryText}>
            выберите пункт выдачи <br /> и оплатите заказ
          </p>
        </div>

        <Image
          src="/icons/arrow.svg"
          alt=""
          width={120}
          height={120}
          className={`${styles.deliveryArrow} ${styles.arrow2}`}
        />

        {/* ШАГ 3 */}
        <div className={`${styles.deliveryStep} ${styles.step3}`}>
          <Image
            src="/icons/step3.png"
            alt=""
            width={150}
            height={150}
            className={styles.deliveryIcon}
          />
          <p className={styles.deliveryText}>Заберите свой заказ</p>
        </div>
      </div>

      <p className={styles.deliveryNote}>
        Доставка по всей РФ: СДЭК · WB · Ozon
      </p>
    </section>
  );
}
