import Link from 'next/link';
import SiteLogo from './icons/Logo';
import siteConfig from '~/config/siteConfig';

export default function PCNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6" aria-label="site logo">
        <SiteLogo className="h-12 -translate-y-1.5" />
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        {siteConfig.navs.map((item) => (
          <Link
            className="text-foreground/80 hover:text-foreground/60 px-4 py-2"
            href={item.href}
            key={item.href}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
