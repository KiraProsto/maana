import 'server-only';

import { cache } from 'react';
import { connection } from 'next/server';
import { getPrisma } from './prisma';
import type { SiteSettings } from './site-settings';

const defaultSettings: SiteSettings = {
  marqueeText: 'MAAHA теперь с тобой. Добро пожаловать в ароматный дом.',
  phone: '+7 (978) 527-83-75',
  email: 'juliya.ist0508@gmail.com',
  telegramUrl: 'https://t.me/HyggeCandleS',
  vkUrl: 'https://vk.ru/hugge_aura',
  maxUrl: 'https://max.ru/u/f9LHodD0cOIr-W0FBa3_vxtJcRG8Q_nSDP5cOTUofBVzeVgrKyBM-jZyqtM',
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  await connection();
  if (!process.env.DATABASE_URL) return defaultSettings;

  const settings = await getPrisma().siteSettings.findUnique({ where: { id: 1 } });
  return settings ?? defaultSettings;
});
