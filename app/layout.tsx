import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import PageHeader from '~/components/layouts/page-header';
import './globals.css';
import siteConfig from '~/config/siteConfig';

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
          <SessionProvider>
            <PageHeader />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
