import Link from 'next/link';
import NextjsIcon from './icons/NextjsIcon';
import JsDelivrIcon from './icons/JsDelivrIcon';
import NetfilyIcon from './icons/NetfilyIcon';

export default function PageFooter() {
  const footerLink = [
    { icon: NextjsIcon, label: 'Nextjs', link: 'https://nextjs.org' },
    { icon: JsDelivrIcon, label: 'jsDelivr ', link: 'https://www.jsdelivr.com/' },
    { icon: NetfilyIcon, label: 'Netfily', link: 'https://app.netlify.com/' },
  ];

  return (
    <footer className="mt-auto box-border border-t bg-zinc-50 p-2 dark:bg-zinc-900 md:p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex flex-col items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300 md:flex-row md:text-base">
          <span aria-label="copyright">©2025 风希落</span>
          <Link
            aria-label="beian"
            href="http://www.beian.gov.cn"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-blue-600"
          >
            豫ICP备2022024874号-2
          </Link>
        </div>

        <div
          aria-label="footer-link"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm md:text-base"
        >
          {footerLink.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener"
              className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-300"
            >
              <span className="inline-flex items-center gap-x-2">
                <item.icon className="h-5 w-5" /> {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
