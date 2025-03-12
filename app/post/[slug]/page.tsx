import ErrorResult from '~/components/layouts/error-result';
import TocTree from '~/components/layouts/toc-tree';
import CustomMDX from '~/components/markdown/custom-mdx';
import { getPostBySlug } from '~/utils/postData';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PostDetail({ params }: Props) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) return <ErrorResult status="404" back="prev" />;

  return (
    <div className="flex">
      <main className="md-container w-full max-w-full py-4 pr-0 md:max-w-[75%] md:pr-4">
        <CustomMDX source={post.content} />
      </main>
      <TocTree />
    </div>
  );
}
