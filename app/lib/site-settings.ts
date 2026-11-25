export interface SiteSettings {
  marqueeText: string;
  phone: string;
  email: string;
  telegramUrl: string;
  vkUrl: string;
  maxUrl: string;
}

export const settingsLimits = {
  marqueeText: 240,
  phone: 40,
  email: 254,
  socialUrl: 500,
};

export const socialNetworks = [
  { field: 'maxUrl', name: 'MAX', icon: 'max.svg', domains: ['max.ru', 'www.max.ru'] },
  { field: 'telegramUrl', name: 'Telegram', icon: 'tg.svg', domains: ['t.me', 'telegram.me'] },
  { field: 'vkUrl', name: 'ВКонтакте', icon: 'vk.svg', domains: ['vk.ru', 'vk.com', 'www.vk.ru', 'www.vk.com'] },
] as const;

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}
