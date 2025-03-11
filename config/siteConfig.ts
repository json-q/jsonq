import { Metadata } from 'next';
import { JsDelivrIcon, NetfilyIcon, NextjsIcon } from '~/components/layouts/page-footer/icons';
import { Cnblog, Github } from '~/components/layouts/page-header/icons';

const siteConfig = {
  theme: 'system',
  navs: [
    { title: '文章', href: '/post' },
    { title: '关于我', href: '/about' },
  ],
  externalLink: [
    { icon: Github, title: 'Github', href: 'https://github.com/json-q/jsonq' },
    { icon: Cnblog, title: 'cnblog', href: 'https://www.cnblogs.com/jsonq' },
    // { icon: Gitee, title: 'Gitee', href: 'https://gitee.com/jsonqi' },
  ],
  footerLink: [
    { icon: NextjsIcon, title: 'Nextjs', href: 'https://nextjs.org' },
    { icon: JsDelivrIcon, title: 'jsDelivr ', href: 'https://www.jsdelivr.com/' },
    { icon: NetfilyIcon, title: 'Netfily', href: 'https://app.netlify.com/' },
  ],
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
  docSearch: {
    appId: process.env.NEXT_PUBLIC_DOC_SEARCH_APP_ID || '',
    indexName: process.env.NEXT_PUBLIC_DOC_SEARCH_INDEX_NAME || '',
    apiKey: process.env.NEXT_PUBLIC_DOC_SEARCH_API_KEY || '',
  },
};

export default siteConfig;
