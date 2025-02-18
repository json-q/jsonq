import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import PageHeader from '~/components/layouts/page-header';
import './globals.css';
import siteConfig from '~/config/siteConfig';
import { ThemeChanger } from '~/components/layouts/page-header/theme';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" enableSystem enableColorScheme>
          <PageHeader />
          {children}
          <ThemeChanger />
        </ThemeProvider>
      </body>
    </html>
  );
}
