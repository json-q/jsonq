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
  docSearch: {
    appId: process.env.NEXT_PUBLIC_DOC_SEARCH_APP_ID || '',
    indexName: process.env.NEXT_PUBLIC_DOC_SEARCH_INDEX_NAME || '',
    apiKey: process.env.NEXT_PUBLIC_DOC_SEARCH_API_KEY || '',
  },
};

export default siteConfig;
