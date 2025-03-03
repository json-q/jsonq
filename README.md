基于 `shadcn ui` 的 Nextjs 博客，简约！

# 特性

- 不依赖数据库，纯 markdown 编写，基于 `rehpy` `remark` 等相关插件渲染，更低的资源消耗
- markdown 修改后的页面热更新(hmr)
  - 文章页面的部分 `clinet` 组件下 hmr 存在异常
- Github Action 实现的 CI CD 自动化 docker 部署
- netfily 作为镜像站点作为备用
- Docker 构建，包括 nginx acme 等，网络桥接保证容器之间通信
- `flexsearch` 实现文章的高性能搜索
- 主题切换
- ~~minio 图床（`v0.0.1` 之后移除）~~
- ~~GitHub OAuth 认证（`v0.0.1` 之后移除）~~

> 由于服务器压力较大，基于 minio 的图片上传及认证已移除，使用 jsdelivr 做图床 cdn 加速，nginx 做路径映射
