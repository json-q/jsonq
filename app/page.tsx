import styles from './home.module.css';
import { cn } from '~/lib/utils';

const desc = [
  {
    heading: 'Feature',
    content: [
      'Nextjs + shadcn （当前为 SSG，旧版为 RSC 则可使用 docker/pm2 部署）',
      '纯 markdown 编写，无后台，使用 rehpy、remark 等相关插件渲染，极低的资源占用',
      '简单实现 markdown 内容更改后的页面热更新（hmr）',
      'Github Action 的 CI/CD 部署',
      '<a class="text-blue-600 dark:text-blue-500" target="_blank" rel="noopener noreferrer" href="https://jsonq.netlify.app">镜像站点</a>托管 netfily',
      'pagefind 本地检索',
      '优秀的性能和可访问性，Lighthouse 评分 95+（文章内容大小会影响 Perfermance）',
      '更多历史功能（目前移除）可移步 <a class="text-blue-600 dark:text-blue-500" target="_blank" rel="noopener noreferrer" href="https://github.com/json-q/jsonq">Github</a>',
    ],
  },
  {
    heading: 'Background',
    content: [
      '从零写该站点的原因之一是很早想接触 Nextjs，在此之前曾使用过 docsify、dumi、hexo 做文档站点',
      '托管服务曾使用过 github pages 和 vercel，在做 CNAME 解析后，访问效果依然不好，netfily 目前未被墙，响应速度较好',
      '图床服务使用 PicGo + jsdelivr 镜像，最初使用 minio，服务器压力较大',
    ],
  },
];

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
