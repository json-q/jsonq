import type { Metadata } from 'next';
import PageHeader from '~/components/layouts/page-header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jsonq’s Blog',
  description: 'Blog power by Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <PageHeader />
        {children}
      </body>
    </html>
  );
}
