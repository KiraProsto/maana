import { Metadata } from 'next';
import Hero from '@/app/components/main/Hero';
import About from '@/app/components/main/About';
import Hits from '@/app/components/main/Hits';
import Composition from '@/app/components/main/Composition';
import Delivery from '@/app/components/main/Delivery';
import Contacts from '@/app/components/main/Contacts';

import { getSiteSettings } from '@/app/lib/site-settings-server';

export const metadata: Metadata = {
  title: 'МААНА | Главная',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getSiteSettings();
  return (
    <>
      <Hero marqueeText={settings.marqueeText} />
      <About />
      <Hits />
      <Composition />
      <Delivery />
      <Contacts settings={settings} />
    </>
  );
}
