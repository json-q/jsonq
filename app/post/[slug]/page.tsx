import type { Metadata } from 'next';
import siteConfig from '~/config/siteConfig';
import ErrorResult from '~/components/layouts/error-result';
import TocTree from '~/components/layouts/toc-tree';
import CustomMDX from '~/components/markdown/custom-mdx';
import { getPostBySlug, getPostList } from '~/utils/postData';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateStaticParams() {
  const posts = await getPostList();

  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const posts = await getPostList();
  const post = posts.find((post) => post.slug === slug);

  return {
    ...siteConfig.metadata,
    title: `${post?.title || '404'} | ${siteConfig.metadata.title}`,
    description: post?.title || siteConfig.metadata.description,
    openGraph: {
      ...siteConfig.metadata.openGraph,
      title: `${post?.title || '404'} | ${siteConfig.metadata.title}`,
    },
  } satisfies Metadata;
}

export default async function PostDetail({ params }: Props) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) return <ErrorResult status="404" back="prev" />;

  return (
    <div className="flex">
      <main data-pagefind-body className="md-container w-full py-4">
        <CustomMDX source={post.content} />
      </main>
      <TocTree />
    </div>
  );
}
