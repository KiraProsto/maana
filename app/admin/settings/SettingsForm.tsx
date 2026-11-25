'use client';

import { useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { settingsLimits } from '@/app/lib/site-settings';
import type { SiteSettings } from '@/app/lib/site-settings';
import { saveSiteSettings } from './actions';
import styles from '../products.module.css';
import form from './settings.module.css';

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [saved, setSaved] = useState(settings);
  const [values, setValues] = useState(settings);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const changed = (Object.keys(values) as (keyof SiteSettings)[]).some((name) => values[name] !== saved[name]);

  function update(name: keyof SiteSettings, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setMessage('');
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !changed) return;
    const data = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await saveSiteSettings(data);
        if ('error' in result) {
          setError(result.error);
          return;
        }
        setSaved(result.settings);
        setValues(result.settings);
        setMessage('Все изменения сохранены');
      } catch {
        setError('Не удалось сохранить настройки. Проверь подключение и попробуй ещё раз.');
      }
    });
  }

  return (
    <form className={form.settings} onSubmit={submit} aria-busy={pending}>
      <div className={styles.pageHeading}>
        <h1 id="settings-title">Настройки</h1>
        <div className={form.actions}>
          <p role="status">{message}</p>
          <button className={styles.searchButton} type="submit" disabled={pending || !changed}>
            {pending ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>

      {error && <p role="alert" className={form.error}>{error}</p>}

      <fieldset className={form.card} disabled={pending}>
        <label>Бегущая строка на главной
          <input name="marqueeText" maxLength={settingsLimits.marqueeText} value={values.marqueeText}
            onChange={(event) => update('marqueeText', event.target.value)} />
        </label>

        <div className={form.contactFields}>
          <label>Телефон
            <input name="phone" type="tel" autoComplete="tel" required maxLength={settingsLimits.phone}
              value={values.phone} onChange={(event) => update('phone', event.target.value)} />
          </label>
          <label>Email
            <input name="email" type="email" autoComplete="email" required maxLength={settingsLimits.email}
              value={values.email} onChange={(event) => update('email', event.target.value)} />
          </label>
        </div>

        <div className={form.socialFields}>
          {([
            ['telegramUrl', 'Telegram'], ['vkUrl', 'ВКонтакте'], ['maxUrl', 'MAX'],
          ] as const).map(([name, label]) => (
            <label key={name}>{label}
              <input name={name} type="url" maxLength={settingsLimits.socialUrl} value={values[name]}
                onChange={(event) => update(name, event.target.value)} />
            </label>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
