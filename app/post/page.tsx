import dayjs from "dayjs";
import type { Metadata } from "next";
import Link from "next/link";
import { getPostList } from "~/utils/postData";

export const metadata: Metadata = {
  title: "Post | Jsonq's Blog",
  description: "学习过程和技术文章的内容记录以及其它随笔",
};

export default async function PostList() {
  const postList = await getPostList();

  return (
    <ul className="m-0 p-0">
      {postList.map((post) => (
        <li
          key={post.url}
          className="dark:hover:bg-accent mb-2 flex w-full flex-col rounded border p-0 hover:bg-slate-50 dark:border-slate-600"
        >
          <Link href={post.url} className="p-4 !text-inherit no-underline hover:text-inherit dark:hover:text-inherit">
            <h5 className="font-bold">{post.title}</h5>
            <div className="mt-2 flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <time>{dayjs(post.publishedAt).format("YYYY-MM-DD")}</time>
              <time>{post.readingTime}</time>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
