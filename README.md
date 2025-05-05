基于 `shadcn ui` 的 Nextjs 博客，简约！

- 当前为 SSG 静态版本
- RSC 版本请查看 v0.0.3

# 特性

- 纯 markdown 编写，无后台，基于 `rehype` `remark` 等相关插件渲染，更低的资源消耗
- markdown 修改后的页面热更新(hmr)
- 基于 Github Action 的 CI CD 自动化部署
- netfily 的镜像站点作为备用（vercel 域名境内基本无法访问，可自定义域名做 dns 解析）
- Docker 构建，包括 nginx acme 等，网络桥接保证容器之间通信
- 主题切换
- SSG 博客，`pagefind` 全文检索
- ~~`flexsearch` 实现文章的高性能搜索（v0.0.3-SSG 后替换为 `pagefind`）~~
- ~~minio 图床（v0.0.1 之后移除）~~
- ~~GitHub OAuth 认证（v0.0.1 之后移除）~~

> 由于服务器压力较大，基于 minio 的图片上传及认证已移除，使用 jsdelivr 做图床 cdn 加速，nginx 做路径映射
