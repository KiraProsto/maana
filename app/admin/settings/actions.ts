'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/auth/session';
import { getPrisma } from '@/app/lib/prisma';
import { settingsLimits, socialNetworks } from '@/app/lib/site-settings';
import type { SiteSettings } from '@/app/lib/site-settings';

export async function saveSiteSettings(form: FormData): Promise<{ error: string } | { settings: SiteSettings }> {
  const session = await verifySession();
  if (session.role !== 'admin' && session.role !== 'developer') {
    throw new Error('Недостаточно прав для изменения настроек.');
  }

  const read = (name: keyof SiteSettings) => {
    const value = form.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  const settings: SiteSettings = {
    marqueeText: read('marqueeText'),
    phone: read('phone'),
    email: read('email'),
    telegramUrl: read('telegramUrl'),
    vkUrl: read('vkUrl'),
    maxUrl: read('maxUrl'),
  };

  if (settings.marqueeText.length > settingsLimits.marqueeText) {
    return { error: 'Бегущая строка должна быть не длиннее 240 символов.' };
  }
  const digits = settings.phone.replace(/\D/g, '');
  if (settings.phone.length > settingsLimits.phone || !/^\+?[\d()\s.\-‑–]+$/.test(settings.phone) ||
      digits.length < 7 || digits.length > 15) {
    return { error: 'Проверь номер телефона.' };
  }
  if (settings.email.length > settingsLimits.email ||
      !/^[\w.!$'*+\-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(settings.email)) {
    return { error: 'Проверь email.' };
  }

  for (const { field, name, domains } of socialNetworks) {
    const value = settings[field];
    if (!value) continue;
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return { error: `Вставь ссылку HTTPS на ${name}.` };
    }
    if (value.length > settingsLimits.socialUrl || url.protocol !== 'https:' ||
        url.username || url.password || url.port || !domains.some((domain) => domain === url.hostname)) {
      return { error: `Вставь ссылку HTTPS на ${name}.` };
    }
    settings[field] = url.href;
  }

  try {
    await getPrisma().siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...settings },
      update: settings,
    });
    revalidatePath('/admin/settings');
    revalidatePath('/(site)', 'layout');
    return { settings };
  } catch (error) {
    console.error('Не удалось сохранить настройки:', error);
    return { error: 'Не удалось сохранить настройки. Попробуй ещё раз.' };
  }
}
