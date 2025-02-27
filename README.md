基于 `shadcn ui` 的 Nextjs 博客，简约！

# 特性

所有服务均在远程服务器运行

- 不依赖数据库，纯 markdown 编写，基于 `rehpy` `remark` 等相关插件渲染
- Github Action 实现的 CI CD 自动化部署
- 使用 Docker 构建，包括 nginx minio 等，使用网络桥接保证容器之间通信
- `flexsearch` 实现文件高性能搜索
- ~~minio 图床~~
- ~~GitHub OAuth 认证~~

> 由于服务器压力较大，基于 minio 的图片上传及认证已移除，使用 jsdelivr 做图床 cdn 加速，nginx 做路径映射
