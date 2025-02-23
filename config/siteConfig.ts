import Cnblog from '~/components/layouts/page-header/icons/Cnblog';
import Github from '~/components/layouts/page-header/icons/Github';

const siteConfig = {
  title: 'Jsonq’s Blog',
  author: 'Jsonq',
  description: 'Blog power by Next.js',
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
};

export default siteConfig;
