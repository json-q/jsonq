import type { Metadata } from "next";

const desc = [
  {
    heading: "Feature",
    content: [
      "Nextjs + shadcn",
      "markdown 编写，使用 rehype remark 等相关插件渲染优化展示",
      "简单实现 markdown 内容更改后的页面 hmr",
      "Github Action 的 CI/CD 部署",
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://jsonq.netlify.app">镜像站点</a> 托管 netlify',
      "pagefind 本地检索（pagefind 仅支持静态页面，因此 RSC 无法使用）",
      "优秀的性能和可访问性，Lighthouse 评分 95+（文章内容大小会影响 Perfermance）",
      '更多历史功能（目前移除）可移步 <a class="text-link" target="_blank" rel="noopener noreferrer" href="https://github.com/json-q/jsonq">Github</a>',
    ],
  },
  {
    heading: "Platform",
    content: [
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://github.com/json-q">Github</a>',
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://gitee.com/jsonqi">Gitee</a>',
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.cnblogs.com/jsonq">博客园</a>（有意义的内容会同步）',
    ],
  },
];

export const metadata: Metadata = {
  title: "Home | Jsonq's Blog",
  description: "基于 Nextjs 的博客, 简约, 专注于内容",
};

export default function Home() {
  return (
    <div className="py-8">
      <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight will-change-auto lg:text-5xl">
        Jsonq&apos;s Blog
      </h1>
      {desc.map((item) => (
        <div key={item.heading} className="px-4 md:px-12">
          <h2 className="my-4 text-3xl font-semibold tracking-tight">{item.heading}</h2>
          <ul className="list-disc">
            {item.content.map((content) => (
              <li className="py-1" key={content} dangerouslySetInnerHTML={{ __html: content }} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
