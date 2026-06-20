import Image from 'next/image';
import styles from './Delivery.module.css';

export default function Delivery() {
  return (
    <section
      className={styles.delivery}
      id="delivery"
      role="region"
      aria-labelledby="delivery-title">
      <h2 id="delivery-title" className={styles.deliveryTitle}>
        ДОСТАВКА И ОПЛАТА
      </h2>

      <div
        className={styles.deliverySteps}
        role="list"
        aria-label="Этапы оформления и получения заказа">
        <div
          className={`${styles.deliveryStep} ${styles.step1}`}
          role="listitem"
          aria-label="Шаг 1: Выберите товар и оформите заказ">
          <Image
            src="/icons/step1.svg"
            alt="Шаг 1"
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
          aria-hidden="true"
          width={120}
          height={120}
          className={`${styles.deliveryArrow} ${styles.arrow1}`}
        />

        <div
          className={`${styles.deliveryStep} ${styles.step2}`}
          role="listitem"
          aria-label="Шаг 2: Выберите пункт выдачи и оплатите заказ">
          <Image
            src="/icons/step2.svg"
            alt="Шаг 2"
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
          aria-hidden="true"
          width={120}
          height={120}
          className={`${styles.deliveryArrow} ${styles.arrow2}`}
        />

        <div
          className={`${styles.deliveryStep} ${styles.step3}`}
          role="listitem"
          aria-label="Шаг 3: Заберите свой заказ">
          <Image
            src="/icons/step3.svg"
            alt="Шаг 3"
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
