import { cn } from '~/lib/utils';
import styles from './home.module.css';
import { Metadata } from 'next';

const desc = [
  {
    heading: 'Feature',
    content: [
      'Nextjs + shadcn （当前为静态导出，便于 pagefind 检索）',
      '纯 markdown 编写，无后台，使用 rehype remark 等相关插件渲染优化展示',
      '简单实现 markdown 内容更改后的页面 hmr',
      'Github Action 的 CI/CD 部署',
      '<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://jsonq.netlify.app">镜像站点</a> 托管 netlify',
      'pagefind 本地检索',
      '优秀的性能和可访问性，Lighthouse 评分 95+（文章内容大小会影响 Perfermance）',
      '更多历史功能（目前移除）可移步 <a class="text-link" target="_blank" rel="noopener noreferrer" href="https://github.com/json-q/jsonq">Github</a>',
    ],
  },
  {
    heading: 'Background',
    content: [
      '基于 Next 搭建的原因之一是很早想接触 Next',
      '曾使用过 Github Pages 和 Vercel 托管，经过 CNAME 解析后，访问效果依然不佳，netlify 目前响应速度较好',
      '图床使用 PicGo + jsdelivr',
    ],
  },
];

export const metadata: Metadata = {
  title: "Post | Jsonq's Blog",
  description: '基于 Nextjs 的博客, 简约, 专注于内容, 不断完善优化',
};

export default function Home() {
  return (
    <div className={cn(styles['home-container'], 'container py-8')}>
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
