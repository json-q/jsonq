基于 `shadcn ui` 的 Nextjs 博客，简约！

# Tag V0.0.3-SSG

## 概述

- 此 tag 版本未合并在主分支，属于单独分支，目的是为了解决全文检索问题而改造，后续不会同步此分支。
- 静态导出时部分不兼容情况下，删除了 `robots.ts` 和 `sitemap.ts`，若以此分支运行，可集成 `next-sitemap` 或自行修改

> 此版本属于 nextjs 的 SSG 静态导出，集成了 `pagefind` 来做全文检索

静态导出的 `out` 目录下为纯 html，部署时需注意的事项可查看 [Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports#deploying)

# 特性

- 纯 markdown 编写，无后台，基于 `rehpy` `remark` 等相关插件渲染，更低的资源消耗
- markdown 修改后的页面热更新(hmr)
- 基于 Github Action 的 CI CD 自动化部署
- netfily 的镜像站点作为备用（vercel 域名境内基本无法访问，可自定义域名做 dns 解析）
- Docker 构建，包括 nginx acme 等，网络桥接保证容器之间通信
- 主题切换
- ~~`flexsearch` 实现文章的高性能搜索（v0.0.3-SSG 替换为 `pagefind`）~~
- ~~minio 图床（v0.0.1 之后移除）~~
- ~~GitHub OAuth 认证（v0.0.1 之后移除）~~

> 由于服务器压力较大，基于 minio 的图片上传及认证已移除，使用 jsdelivr 做图床 cdn 加速，nginx 做路径映射
