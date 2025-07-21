import type { Metadata } from "next";
import { JsDelivrIcon, NetlifyIcon, NextjsIcon } from "~/components/layouts/page-footer/icons";
import { Cnblog, Github } from "~/components/layouts/page-header/icons";

const siteConfig = {
  theme: "system",
  navs: [
    { title: "首页", href: "/" },
    { title: "文章", href: "/post" },
    { title: "关于我", href: "/about" },
  ],
  externalLink: [
    { icon: Github, title: "Github", href: "https://github.com/json-q/jsonq" },
    { icon: Cnblog, title: "cnblog", href: "https://www.cnblogs.com/jsonq" },
    // { icon: Gitee, title: 'Gitee', href: 'https://gitee.com/jsonqi' },
  ],
  footerLink: [
    { icon: NextjsIcon, title: "Nextjs", href: "https://nextjs.org" },
    { icon: JsDelivrIcon, title: "jsDelivr ", href: "https://www.jsdelivr.com" },
    { icon: NetlifyIcon, title: "Netlify", href: "https://app.netlify.com" },
  ],
  metadata: {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_HOST!),
    title: "Jsonq's Blog",
    // title: {
    //   default: "Jsonq's Blog",
    //   template: `%s | Jsonq's Blog`,
    // },
    description: "记录工作和学习过程中遇到的问题和相关解决思路以及部分随笔",
    openGraph: {
      title: "Jsonq",
      description: "记录工作和学习过程中遇到的问题和相关解决思路以及部分随笔",
      url: process.env.NEXT_PUBLIC_SITE_HOST,
      siteName: "Jsonq",
      locale: "zh-CN",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
  } satisfies Metadata,
};

export default siteConfig;
