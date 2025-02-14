import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post | Jsonq’s Blog',
  description: 'Daily work and study notes, front、back end and more',
};

export default function PostLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-wrapper">
          <div className="container flex h-14 items-center">000</div>
        </div>
      </header>
      <article className="prose m-auto dark:prose-invert md:max-w-[90%]">{children}</article>
    </>
  );
}
