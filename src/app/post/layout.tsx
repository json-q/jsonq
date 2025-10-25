export default function PostLayout({ children }: LayoutProps<"/post">) {
  return <article className="prose dark:prose-invert max-w-full">{children}</article>;
}
