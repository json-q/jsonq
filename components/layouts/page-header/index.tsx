import { Button } from '~/components/ui/button';
import MobileNav from './mobile-nav';
import PCNav from './pc-nav';
import Link from 'next/link';
import siteConfig from '~/config/siteConfig';
import ThemeSwitcher from './theme-switcher';
import DocSearch from './doc-search';
import SignIn from '~/components/auth/sign-in';

export default function PageHeader() {
  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper">
        <div className="container flex h-14 items-center">
          <PCNav />
          <MobileNav />
          <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <DocSearch />
            </div>
            <nav className="flex items-center gap-0.5">
              {siteConfig.externalLink.map((item) => (
                <Button
                  key={item.title}
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 px-0"
                >
                  <Link href={item.href} target="_blank" rel="noreferrer">
                    <item.icon className="h-4 w-4" />
                    <span className="sr-only">cnblog</span>
                  </Link>
                </Button>
              ))}

              <ThemeSwitcher />
              <SignIn />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
