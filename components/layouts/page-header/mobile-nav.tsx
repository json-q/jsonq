"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import siteConfig from "~/config/siteConfig";
import { cn } from "~/lib/utils";
import SiteLogo from "./icons/Logo";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "extend-touch-target !p-0 h-8 touch-manipulation items-center justify-start gap-2.5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent",
            "flex md:hidden",
          )}
        >
          <div className="relative flex h-8 w-4 items-center justify-center">
            <div className="relative size-4">
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                  open ? "-rotate-45 top-[0.4rem]" : "top-1",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                  open ? "top-[0.4rem] rotate-45" : "top-2.5",
                )}
              />
            </div>
            <span className="sr-only">Toggle Page</span>
          </div>
        </Button>
      </PopoverTrigger>

      <Link href="/" aria-label="site logo">
        <SiteLogo className="-translate-y-1.5 block h-10 md:hidden" />
      </Link>

      <PopoverContent
        className="no-scrollbar h-(--radix-popper-available-height) w-(--radix-popper-available-width) overflow-y-auto rounded-none border-none bg-background/90 p-0 shadow-none backdrop-blur duration-100"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={14}
      >
        <div className="flex flex-col gap-4 overflow-auto px-6 py-6">
          {siteConfig.navs.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => handleOpenChange(false)}>
              {item.title}
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
