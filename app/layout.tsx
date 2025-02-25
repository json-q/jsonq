import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import PageHeader from '~/components/layouts/page-header';
import siteConfig from '~/config/siteConfig';
import './globals.css';

export const metadata: Metadata = siteConfig.metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" enableSystem enableColorScheme>
          <SessionProvider>
            <PageHeader />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
