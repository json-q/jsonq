import { Metadata } from 'next';
import Cnblog from '~/components/layouts/page-header/icons/Cnblog';
import Github from '~/components/layouts/page-header/icons/Github';

const siteConfig = {
  theme: 'system',
  navs: [
    { title: '文章', href: '/post' },
    { title: '图床', href: '/picture' },
    { title: '关于我', href: '/about' },
  ],
  externalLink: [
    {
      title: 'Github',
      href: 'https://github.com/json-q/jsonq',
      icon: Github,
    },
    {
      title: 'cnblog',
      href: 'https://www.cnblogs.com/jsonq',
      icon: Cnblog,
    },
    // {
    //   title: 'Gitee',
    //   href: 'https://gitee.com/jsonqi',
    //   icon: Gitee,
    // },
  ],
  minio: {
    accessKey: process.env.NEXT_PUBLIC_MINIO_ACCESS_KEY,
    secretKey: process.env.NEXT_PUBLIC_MINIO_SECRET_KEY,
    endPoint: process.env.NEXT_PUBLIC_MINIO_END_POINT || '',
    bucket: process.env.NEXT_PUBLIC_MINIO_BUCKET || '',
  },
  metadata: {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_HOST!),
    title: {
      default: "Jsonq's Blog",
      template: `%s | Jsonq's Blog`,
    },
    description: 'documenting experiences and reflections during the process of work and study.',
    openGraph: {
      title: 'Jsonq',
      description: 'documenting experiences and reflections during the process of work and study.',
      url: process.env.NEXT_PUBLIC_SITE_HOST,
      siteName: 'Jsonq',
      locale: 'zh-CN',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
  } satisfies Metadata,
};

export default siteConfig;
