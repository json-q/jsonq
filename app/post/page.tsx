import Link from 'next/link';
import type { Metadata } from 'next';
import dayjs from 'dayjs';
import { getPostList } from '~/utils/postData';

export const metadata: Metadata = {
  title: "Post | Jsonq's Blog",
};

export default async function PostList() {
  const postList = await getPostList();

  return (
    <ul className="m-0 p-0">
      {postList.map((post) => (
        <Link
          key={post.url}
          href={post.url}
          className="!text-inherit no-underline hover:text-inherit dark:hover:text-inherit"
        >
          <li className="dark:hover:bg-accent mb-4 flex w-full flex-col rounded border p-4 hover:bg-slate-50 dark:border-slate-600">
            <h5 className="font-bold">{post.title}</h5>
            <div className="mt-2 flex justify-between text-sm text-slate-400">
              <time>{dayjs(post.publishedAt).format('YYYY-MM-DD')}</time>
              <time>{post.readingTime}</time>
            </div>
          </li>
        </Link>
      ))}
    </ul>
  );
}
