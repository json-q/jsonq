/**
 * Site UI strings — single-language (Chinese).
 * Replaces the template's i18n module; no multilingual support.
 */

export const t = {
  nav: {
    home: "首页",
    posts: "文章",
    tags: "标签",
    about: "关于",
    search: "搜索",
  },
  post: {
    updatedAt: "更新时间",
    backToTop: "回到顶部",
    goBack: "返回",
    previousPost: "上一篇",
    nextPost: "下一篇",
  },
  pagination: {
    prev: "上一页",
    next: "下一页",
    page: "第",
  },
  home: {
    socialLinks: "社交链接",
    recentPosts: "最新文章",
    allPosts: "全部文章",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  pages: {
    tagTitle: "标签",
    tagDesc: "关于该标签的所有文章",

    tagsTitle: "标签",
    tagsDesc: "文章中使用的所有标签。",

    postsTitle: "文章",
    postsDesc: "发布的所有文章。",

    searchTitle: "搜索",
    searchDesc: "搜索任何文章...",
  },
  a11y: {
    skipToContent: "跳转到内容",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    toggleTheme: "切换主题",
    goToPreviousPage: "上一页",
    goToNextPage: "下一页",
  },
  notFound: {
    title: "404 未找到",
    message: "页面未找到",
    goHome: "返回首页",
  },
} as const;
