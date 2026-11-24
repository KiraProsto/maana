import Image from 'next/image';
import { socialNetworks } from '@/app/lib/site-settings';
import type { SiteSettings } from '@/app/lib/site-settings';

export default function SocialLinks({
  settings,
  className,
  size = 38,
  iconClassName,
}: {
  settings: SiteSettings;
  className: string;
  size?: number;
  iconClassName?: string;
}) {
  const links = socialNetworks.filter(({ field }) => settings[field]);
  if (!links.length) return null;

  return (
    <div className={className}>
      {links.map(({ field, name, icon }) => (
        <a key={field} href={settings[field]} target="_blank" rel="noopener noreferrer"
          aria-label={`Написать в ${name}`}>
          <Image src={`/icons/message/${icon}`} alt="" className={iconClassName} width={size} height={size} />
        </a>
      ))}
    </div>
  );
}
