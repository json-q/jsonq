import Cnblog from '~/components/layouts/page-header/icons/Cnblog';
import Github from '~/components/layouts/page-header/icons/Github';

const siteConfig = {
  title: 'Jsonq’s Blog',
  author: 'Jsonq',
  description: 'Blog power by Next.js',
  theme: 'system',
  navs: [
    { title: '文章', href: '/post' },
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
};

export default siteConfig;
