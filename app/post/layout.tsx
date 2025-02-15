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
    <article className="container-wrapper prose dark:prose-invert">
      <div className="container">{children}</div>
    </article>
  );
}
