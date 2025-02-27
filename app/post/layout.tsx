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
