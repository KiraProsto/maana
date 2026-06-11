'use client';

import { useForm } from 'react-hook-form';
import styles from '../checkout.module.css';

type FormData = {
  fio: string;
  phone: string;
  email: string;
  city: string;
  street: string;
  house: string;
  flat?: string;
  delivery: string;
  consent: boolean;
};

export default function CheckoutForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.checkoutForm}
      aria-label="Форма оформления заказа">
      <input
        id="fio"
        type="text"
        placeholder="ФИО получателя"
        className={`${styles.inputFull} ${errors.fio ? styles.inputError : ''}`}
        autoComplete="name"
        {...register('fio', { required: 'Введите ФИО получателя' })}
      />
      {errors.fio && (
        <span className={styles.errorMsg}>{errors.fio.message}</span>
      )}

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <input
            id="phone"
            type="text"
            placeholder="Ваш номер телефона"
            className={errors.phone ? styles.inputError : ''}
            autoComplete="tel"
            {...register('phone', {
              required: 'Введите номер телефона',
              pattern: {
                value: /^[\d\s\+\-\(\)]{7,18}$/,
                message: 'Некорректный номер телефона',
              },
            })}
          />
          {errors.phone && (
            <span className={styles.errorMsg}>{errors.phone.message}</span>
          )}
        </div>

        <div className={styles.formCol}>
          <input
            id="email"
            type="text"
            placeholder="Ваш e-mail"
            className={errors.email ? styles.inputError : ''}
            autoComplete="email"
            {...register('email', {
              required: 'Введите e-mail',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Некорректный e-mail',
              },
            })}
          />
          {errors.email && (
            <span className={styles.errorMsg}>{errors.email.message}</span>
          )}
        </div>
      </div>

      <h3 className={styles.deliveryTitle}>Доставка</h3>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <input
            id="city"
            type="text"
            placeholder="Город"
            className={errors.city ? styles.inputError : ''}
            autoComplete="address-level2"
            {...register('city', { required: 'Введите город' })}
          />
          {errors.city && (
            <span className={styles.errorMsg}>{errors.city.message}</span>
          )}
        </div>

        <div className={styles.formCol}>
          <input
            id="street"
            type="text"
            placeholder="Улица"
            className={errors.street ? styles.inputError : ''}
            autoComplete="address-line1"
            {...register('street', { required: 'Введите улицу' })}
          />
          {errors.street && (
            <span className={styles.errorMsg}>{errors.street.message}</span>
          )}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <input
            id="house"
            type="text"
            placeholder="Дом"
            className={errors.house ? styles.inputError : ''}
            {...register('house', { required: 'Введите номер дома' })}
          />
          {errors.house && (
            <span className={styles.errorMsg}>{errors.house.message}</span>
          )}
        </div>

        <div className={styles.formCol}>
          <input
            id="flat"
            type="text"
            placeholder="Квартира / Офис"
            {...register('flat')}
          />
        </div>
      </div>

      <div
        className={styles.deliveryRow}
        role="radiogroup"
        aria-label="Способ доставки">
        <label htmlFor="delivery-cdek">
          <input
            id="delivery-cdek"
            type="radio"
            value="СДЭК"
            {...register('delivery', { required: 'Выберите способ доставки' })}
          />{' '}
          СДЭК (от 2 дней)
        </label>
        <label htmlFor="delivery-wb">
          <input
            id="delivery-wb"
            type="radio"
            value="WB"
            {...register('delivery')}
          />{' '}
          WB (от 2 дней)
        </label>
        <label htmlFor="delivery-ozon">
          <input
            id="delivery-ozon"
            type="radio"
            value="OZON"
            {...register('delivery')}
          />{' '}
          OZON (от 2 дней)
        </label>
      </div>
      {errors.delivery && (
        <span className={styles.errorMsg}>{errors.delivery.message}</span>
      )}

      <div className={styles.consentBlock}>
        <label className={styles.consentLabel}>
          <input
            type="checkbox"
            id="consent"
            {...register('consent', { required: 'Необходимо дать согласие' })}
          />
          <span>
            Даю{' '}
            <a
              href="/docs/personal-data"
              target="_blank"
              rel="noopener noreferrer">
              согласие на обработку моих персональных данных
            </a>{' '}
            и согласен с{' '}
            <a href="/docs/privacy" target="_blank" rel="noopener noreferrer">
              политикой конфиденциальности
            </a>
            .
          </span>
        </label>
        {errors.consent && (
          <span className={styles.errorMsg}>{errors.consent.message}</span>
        )}

        <p className={styles.consentNote}>
          *Согласно закону «О защите прав потребителя», возврат и последующая
          доставка осуществляется за счёт покупателя.
        </p>
      </div>

      <button
        className={styles.checkoutBtn}
        type="submit"
        aria-label="Отправить заказ">
        Заказать
      </button>
    </form>
  );
}
