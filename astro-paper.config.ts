import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: import.meta.env.PUBLIC_SITE_URL,
    title: "Jsonq's Blog",
    description: "记录随笔和学习笔记",
    author: "jsonq",
    profile: "https://github.com/json-q/jsonq",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 5,
  },
  features: {
    lightAndDarkMode: true,
    showBackButton: true,
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/json-q/jsonq" },
    { name: "cnblogs", url: "https://www.cnblogs.com/jsonq" },
    { name: "mail", url: "mailto:9967300508@163.com" },
  ],
});
