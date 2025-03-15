'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';
import siteConfig from '~/config/siteConfig';
import SiteLogo from './icons/Logo';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="navigate page"
            variant="ghost"
            className="mr-2 -ml-2 size-8 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="!size-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-4">
          <Link href="/">
            <DropdownMenuItem
              className={cn({
                'bg-zinc-100': pathname == '/',
                'dark:bg-zinc-800': pathname == '/',
              })}
            >
              首页
            </DropdownMenuItem>
          </Link>
          {siteConfig.navs.map((item) => (
            <Link href={item.href} key={item.href}>
              <DropdownMenuItem
                className={cn({
                  'bg-zinc-100': pathname == item.href,
                  'dark:bg-zinc-800': pathname == item.href,
                })}
              >
                {item.title}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/" aria-label="site logo">
        <SiteLogo className="block h-10 -translate-y-1.5 md:hidden" />
      </Link>
    </>
  );
}
