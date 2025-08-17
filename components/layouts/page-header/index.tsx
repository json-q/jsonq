import Link from "next/link";
import { Button } from "~/components/ui/button";
import siteConfig from "~/config/siteConfig";
import DocSearch from "./doc-search";
import MobileNav from "./mobile-nav";
import PCNav from "./pc-nav";
import ThemeSwitcher from "./theme-switcher";

export default function PageHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-grid border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="m-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center">
          <PCNav />
          <MobileNav />
          <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <DocSearch />
            </div>
            <nav className="flex items-center gap-0.5">
              {siteConfig.externalLink.map((item) => (
                <Button key={item.title} asChild variant="ghost" size="icon" className="size-8 px-0">
                  <Link href={item.href} target="_blank" rel="noreferrer">
                    <item.icon className="size-4" />
                    <span className="sr-only">{item.title}</span>
                  </Link>
                </Button>
              ))}

              <ThemeSwitcher />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
