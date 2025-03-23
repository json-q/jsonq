export default function PostLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <article className="prose dark:prose-invert container">{children}</article>;
}
