import ErrorResult from '~/components/layouts/error-result';
import TocTree from '~/components/layouts/toc-tree';
import CustomMDX from '~/components/markdown/custom-mdx';
import { getPostBySlug, getPostList } from '~/utils/postData';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// export async function getStaticPaths() {
//   const posts = await getAllPosts(); // 获取所有文章的 slug 列表
//   return {
//     paths: posts.map((post) => ({ params: { slug: post.slug } })),
//     fallback: false, // 如果有未预渲染的路径，则返回 404 页面
//   };
// }

// export async function getStaticProps({ params }: { params: { slug: string } }) {
//   const post = await getPostBySlug(params.slug);
//   return {
//     props: { post },
//   };
// }

export async function generateStaticParams() {
  const posts = await getPostList();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostDetail({ params }: Props) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) return <ErrorResult status="404" back="prev" />;

  return (
    <div className="flex">
      <main
        data-pagefind-body
        className="md-container w-full max-w-full py-4 pr-0 md:max-w-[75%] md:pr-4"
      >
        <CustomMDX source={post.content} />
      </main>
      <TocTree />
    </div>
  );
}
