import ErrorResult from '~/components/layouts/error-result';
import CustomMDX from '~/components/markdown/custom-mdx';
import allPosts from '~/generated/content.json';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post = allPosts.find((post) => post.slug === slug);

  if (!post) return <ErrorResult status="404" back="prev" />;

  return <CustomMDX source={post.content} />;
}
