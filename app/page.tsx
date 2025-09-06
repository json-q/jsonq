import type { Metadata } from "next";
import { getPostList } from "~/utils/postData";

const desc = [
  {
    heading: "Platform",
    content: [
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://github.com/json-q">Github</a>',
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://gitee.com/jsonqi">Gitee</a>',
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.cnblogs.com/jsonq">博客园</a>（有意义的内容会同步）',
    ],
  },
  {
    heading: "Feature",
    content: [
      "Nextjs + shadcn",
      "markdown 编写，rehype remark 等相关插件优化展示",
      "简单实现 markdown 编写保存时的页面 hmr",
      "Github Action 自动化部署",
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://jsonq.netlify.app">镜像站点</a> 托管 netlify',
      "pagefind 本地检索（pagefind 仅支持 SSG）",
      "优秀的性能和可访问性，Lighthouse 评分 95+（文章内容大小会影响 Performance）",
    ],
  },
];

export const metadata: Metadata = {
  title: "Home | Jsonq's Blog",
  description: "基于 Nextjs 的博客, 简约, 专注于内容",
};

export default async function Home() {
  const postList = await getPostList();

  const mergedDesc = [
    {
      heading: "Recently Updated",
      content: postList
        .slice(0, 5)
        .map((item) => `<a class="underline hover:text-link transition-colors" href=${item.url}>${item.title}</a>`),
    },
    ...desc,
  ];

  return (
    <div className="py-8">
      <h1 className="mb-4 text-center font-extrabold text-4xl tracking-tight will-change-auto lg:text-5xl">
        Jsonq&apos;s Blog
      </h1>
      {mergedDesc.map((item) => (
        <div key={item.heading} className="px-4 md:px-12">
          <h2 className="my-4 font-semibold text-3xl tracking-tight">{item.heading}</h2>
          <ul className="list-disc [&>li]:ml-4">
            {item.content.map((content) => (
              <li className="py-1" key={content} dangerouslySetInnerHTML={{ __html: content }} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
