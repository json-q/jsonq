import Link from 'next/link';
import { getAllPost } from '~/utils/postData';
import dayjs from 'dayjs';

export default function PostList() {
  const allPosts = getAllPost();

  return (
    <ul>
      {allPosts.map((post) => (
        <Link
          key={post.url}
          href={post.url}
          className="text-inherit no-underline hover:text-inherit"
        >
          <li className="mb-4 flex w-full flex-col rounded border p-4 hover:bg-slate-50 hover:shadow-sm dark:border-slate-600 dark:bg-black dark:hover:bg-slate-900 dark:hover:shadow-sm">
            <h5 className="font-bold">{post.title}</h5>
            <div className="flex justify-between">
              <time className="mt-2 text-sm text-slate-400">
                {dayjs(post.publishedAt).format('YYYY-MM-DD')}
              </time>
            </div>
          </li>
        </Link>
      ))}
    </ul>
  );
}
