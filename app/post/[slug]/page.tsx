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

  const post = getPostBySlug(slug);

  if (!post) return <ErrorResult status="404" back="prev" />;

  return (
    <div className="flex">
      <main className="w-full max-w-full py-4 pr-4 md:max-w-[75%]">
        <CustomMDX source={post.content} />
      </main>
      <div className="w-full max-w-[25%]">
        {/* calc top offset: header: 3 container: pt-1 pb-1 rem*/}
        <nav className="sticky top-20 max-h-screen overflow-y-auto border-l border-l-gray-200 px-4 dark:border-l-gray-700">
          <TocTree toc={post.toc} />
        </nav>
      </div>
    </div>
  );
}
