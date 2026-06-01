'use client';

import styles from '../checkout.module.css';

export default function CheckoutForm() {
  return (
    <div
      className={styles.checkoutForm}
      role="form"
      aria-label="Форма оформления заказа">
      <input
        id="fio"
        type="text"
        placeholder="ФИО получателя"
        className={styles.inputFull}
        aria-required="true"
        autoComplete="name"
      />

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <input
            id="phone"
            type="text"
            placeholder="Ваш номер телефона"
            aria-required="true"
            autoComplete="tel"
          />
        </div>

        <div className={styles.formCol}>
          <input
            id="email"
            type="text"
            placeholder="Ваш e-mail"
            aria-required="true"
            autoComplete="email"
          />
        </div>
      </div>

      <h3 className={styles.deliveryTitle}>Доставка</h3>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <input
            id="city"
            type="text"
            placeholder="Город"
            aria-required="true"
            autoComplete="address-level2"
          />
        </div>

        <div className={styles.formCol}>
          <input
            id="street"
            type="text"
            placeholder="Улица"
            aria-required="true"
            autoComplete="address-line1"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <input
            id="house"
            type="text"
            placeholder="Дом"
            aria-required="true"
          />
        </div>

        <div className={styles.formCol}>
          <input id="flat" type="text" placeholder="Квартира / Офис" />
        </div>
      </div>

      <div
        className={styles.deliveryRow}
        role="radiogroup"
        aria-label="Способ доставки">
        <label htmlFor="delivery-cdek">
          <input id="delivery-cdek" type="radio" name="delivery" value="СДЭК" />{' '}
          СДЭК (2 дня)
        </label>

        <label htmlFor="delivery-wb">
          <input id="delivery-wb" type="radio" name="delivery" value="WB" />
          WB (2 дня)
        </label>

        <label htmlFor="delivery-ozon">
          <input id="delivery-ozon" type="radio" name="delivery" value="OZON" />
          OZON (2 дня)
        </label>
      </div>

      <button
        className={styles.checkoutBtn}
        type="button"
        aria-label="Отправить заказ">
        Заказать
      </button>
    </div>
  );
}
