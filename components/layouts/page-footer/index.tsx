import Link from "next/link";
import siteConfig from "~/config/siteConfig";

export default function PageFooter() {
  return (
    <footer className="mt-auto box-border border-t bg-zinc-50 p-2 md:p-4 dark:bg-zinc-900">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex flex-col items-center gap-4 text-sm text-zinc-600 md:flex-row md:text-base dark:text-zinc-300">
          <span>©2025 Jsonq</span>
          <Link
            aria-label="beian"
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener"
            className="hover:text-link transition-colors"
          >
            豫ICP备2022024874号-2
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-600 md:text-base dark:text-zinc-300">
          {siteConfig.footerLink.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener"
              className="hover:text-link transition-colors"
            >
              <span className="inline-flex items-center gap-x-2">
                <item.icon className="size-5" /> {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
