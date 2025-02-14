import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
