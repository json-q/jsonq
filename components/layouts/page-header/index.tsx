import { Button } from '~/components/ui/button';
import CommandMenu from './command-menu';
import MobileNav from './mobile-nav';
import PCNav from './pc-nav';
import Link from 'next/link';
import siteConfig from '~/config/siteConfig';

export default function PageHeader() {
  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper">
        <div className="container flex h-14 items-center">
          <PCNav />
          <MobileNav />
          <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <CommandMenu />
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

              {/* <ModeSwitcher /> */}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
