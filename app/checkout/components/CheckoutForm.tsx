'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import styles from '../checkout.module.css';
import { useCart } from '@/app/context/CartContext';
import { useDelivery } from '@/app/context/DeliveryContext';
import { useSearchParams } from 'next/navigation';
import { products } from '@/app/data/products';
import { holders } from '@/app/data/holders';
import { sachets } from '@/app/data/sachets';

type FormData = {
  fio: string;
  phone: string;
  email: string;
  city: string;
  pickupAddress: string;
  delivery: string;
  consent: boolean;
  comment?: string;
};

function calcMarketplaceCost(weightGrams: number): number {
  if (weightGrams <= 500) return 249;
  if (weightGrams <= 1000) return 380;
  if (weightGrams <= 2000) return 480;
  return 500;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { cart } = useCart();
  const { deliveryCost, deliveryDays, setDelivery, setDeliveryLoading } =
    useDelivery();
  const params = useSearchParams();
  const singleId = params.get('product');
  const allProducts = [...products, ...holders, ...sachets];

  const [cdekLoading, setCdekLoading] = useState(false);
  const [cdekError, setCdekError] = useState<string | null>(null);

  const totalItems = singleId
    ? cart[singleId] || 1
    : Object.values(cart).reduce((s, c) => s + c, 0);
  const estimatedWeight = Math.max(300, totalItems * 300);
  const marketplaceCost = calcMarketplaceCost(estimatedWeight);

  let total = 0;
  if (singleId) {
    const product = allProducts.find((p) => p.id === Number(singleId));
    if (product) {
      total =
        Number(String(product.price).replace(/\D/g, '')) *
        (cart[singleId] || 1);
    }
  } else {
    total = Object.entries(cart).reduce((sum, [id, count]) => {
      const product = allProducts.find((p) => p.id === Number(id));
      if (!product) return sum;
      return sum + Number(String(product.price).replace(/\D/g, '')) * count;
    }, 0);
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const deliveryValue = watch('delivery');
  const cityValue = watch('city');

  useEffect(() => {
    if (deliveryValue === 'WB') {
      setDeliveryLoading(true);
      setDelivery(0, null);
      setCdekError(null);
      const t = setTimeout(() => {
        setDelivery(marketplaceCost, 'от 2 дней');
        setDeliveryLoading(false);
      }, 600);
      return () => clearTimeout(t);
    }

    if (deliveryValue === 'OZON') {
      setDeliveryLoading(true);
      setDelivery(0, null);
      setCdekError(null);
      const t = setTimeout(() => {
        setDelivery(249, 'от 2 дней');
        setDeliveryLoading(false);
      }, 600);
      return () => clearTimeout(t);
    }

    if (deliveryValue !== 'СДЭК') {
      setDelivery(0, null);
      setCdekError(null);
      return;
    }

    if (!cityValue?.trim() || cityValue.trim().length < 2) {
      setDelivery(0, null);
      setCdekError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCdekLoading(true);
      setCdekError(null);
      try {
        const res = await fetch('/api/cdek', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: cityValue.trim(),
            weight: estimatedWeight,
          }),
        });
        const data = await res.json();

        if (data.error) {
          setCdekError('Не удалось рассчитать доставку для этого города');
          setDelivery(0, null);
        } else {
          setDelivery(data.cost, `${data.periodMin}–${data.periodMax} дн.`);
        }
      } catch {
        setCdekError('Ошибка соединения при расчёте доставки');
        setDelivery(0, null);
      } finally {
        setCdekLoading(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [deliveryValue, cityValue]);

  const onSubmit = async (data: FormData) => {
    const grandTotal = total + deliveryCost;

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal.toFixed(2),
          description: `Заказ для ${data.fio}${data.comment ? `. Комментарий: ${data.comment}` : ''}`,
          returnUrl: `${window.location.origin}/payment-success`,
          metadata: {
            fio: data.fio,
            phone: data.phone,
            email: data.email,
            city: data.city,
            pickupAddress: data.pickupAddress,
            delivery: data.delivery,
            deliveryCost: String(deliveryCost),
            comment: data.comment || '',
            items: JSON.stringify(
              (singleId
                ? allProducts.filter((p) => p.id === Number(singleId))
                : Object.keys(cart)
                    .map((id) => allProducts.find((p) => p.id === Number(id)))
                    .filter(Boolean)
              ).map((p) => ({
                id: p!.id,
                name: p!.name,
                count: cart[String(p!.id)] || 1,
                price: Number(String(p!.price).replace(/\D/g, '')),
              })),
            ),
          },
        }),
      });

      const result = await res.json();

      if (result.confirmationUrl) {
        router.push(result.confirmationUrl);
      } else {
        alert('Ошибка при создании платежа');
      }
    } catch {
      alert('Что-то пошло не так');
    }
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
      <p className={styles.deliveryNote}>Доставляем только до пунктов выдачи</p>

      <div className={styles.formRow}>
        <div className={styles.formColSm}>
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

        <div className={styles.formColLg}>
          <input
            id="pickupAddress"
            type="text"
            placeholder="Адрес пункта выдачи"
            className={errors.pickupAddress ? styles.inputError : ''}
            {...register('pickupAddress', {
              required: 'Введите адрес пункта выдачи',
            })}
          />
          {errors.pickupAddress && (
            <span className={styles.errorMsg}>
              {errors.pickupAddress.message}
            </span>
          )}
        </div>
      </div>

      <textarea
        className={styles.comment}
        placeholder="Некоторые товары имеют варианты дизайна, если такой товар есть у вас в заказе, уточните: вариант А, вариант Б"
        {...register('comment')}></textarea>

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
          СДЭК
          {cdekLoading
            ? ' (считаем…)'
            : deliveryDays && deliveryValue === 'СДЭК'
              ? ` (${deliveryDays})`
              : ''}
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
        <label htmlFor="delivery-ozon" className={styles.deliveryLabelOzon}>
          <input
            id="delivery-ozon"
            type="radio"
            value="OZON"
            {...register('delivery')}
          />{' '}
          OZON (от 2 дней)
          <span className={styles.ozonTooltipWrapper}>
            <Image
              src="/icons/attention.svg"
              alt="Важно"
              width={16}
              height={16}
              className={styles.ozonAttentionIcon}
            />
            <span className={styles.ozonTooltip}>
              Укажите номер телефона, привязанный к вашему аккаунту Ozon — без
              этого вы не сможете забрать посылку
            </span>
          </span>
        </label>
      </div>
      {errors.delivery && (
        <span className={styles.errorMsg}>{errors.delivery.message}</span>
      )}

      {deliveryValue === 'СДЭК' && !cdekLoading && cdekError && (
        <span className={styles.errorMsg}>{cdekError}</span>
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
