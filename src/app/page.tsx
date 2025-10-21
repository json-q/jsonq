import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPostList } from "@/utils/postData";

export const metadata: Metadata = {
  title: "Home | Jsonq's Blog",
  description: "基于 Nextjs 的博客, 简约, 专注于内容",
};

const titleCls = cn("my-4 font-semibold text-xl");
const ulCls = cn("ml-4 list-disc [&>li]:ml-4");

const platform = [
  { title: "Github", url: "https://github.com/json-q" },
  { title: "Gitee", url: "https://gitee.com/jsonqi" },
  { title: "博客园", url: "https://www.cnblogs.com/jsonq" },
];

export default async function Home() {
  const postList = await getPostList();

  return (
    <div className="py-8">
      <h1 className="mb-4 text-center font-extrabold text-3xl will-change-auto lg:text-4xl">Jsonq&apos;s Blog</h1>
      <div className="px-4 md:px-12">
        <h2 className={titleCls}>介绍</h2>
        <p className="indent-4">
          基于 Nextjs 的静态博客网站，托管于
          <Link rel="noopener noreferrer" target="_blank" href="https://netlify.com" className="ml-2 text-link">
            Netlify
          </Link>
        </p>

        <h2 className={titleCls}>最新文章</h2>
        <ul className={ulCls}>
          {postList.slice(0, 5).map((item) => (
            <li className="py-1" key={item.slug}>
              <Link className="hover:underline" href={item.url}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        <h2 className={titleCls}>写作平台</h2>
        <ul className={ulCls}>
          {platform.map((item) => (
            <li className="py-1" key={item.title}>
              <Link rel="noopener noreferrer" target="_blank" className="text-link" href={item.url}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
