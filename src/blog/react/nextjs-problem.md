---
title: Nextjs windows 打包部分问题汇总
pubDate: 2025-08-03
description: Next.js 在 Windows 环境下使用 pnpm 打包时 symlink 错误和静态资源 404 等问题
tags:
  - next
---

## Table of contents

## windows 上使用 pnpm 在 build 报错 [operation not permitted, symlink xxx]

此问题详见 [Nextjs Discussion](https://github.com/vercel/next.js/discussions/52244)

解决方案 1：使用 npm 或者 yarn（可以仅打包使用，但要保证安装版本）

解决方案 2：开启开发者模式

- win10 设置 -> 更新和安全 -> 开发者选项 -> 开启开发人员模式（因电脑而异）
- win11 系统 -> 开发人员模式（因电脑而异）

## 生产构建后的静态资源 404

参考 [Nextjs 文档](https://nextjs.org/docs/advanced-features/output-file-tracing)

原因是打包的 `.next` 不包含静态资源（css、public 下的资源）

Nextjs 官方认为这些应该放在 CDN 上，但是可以手动复制到 .next 对应文件夹下

Mac 系统命令如下：

```bash
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
```

Windows 上此处使用 `cpr` 包实现，可以在 `next build` 后执行此命令

```bash
cpr public .next/standalone/public && cpr .next/static .next/standalone/.next/static
```

值得注意的是：Mac 下的 `cp -r` 是将 source 目录拷贝到 destination 下，而 `cpr` 这个包是将 source 目录下的文件拷贝到 destination 下，两者行为有差异

## pnpm build 经常在多次 build 后出现错误

感觉 Nextjs 的设计和 pnpm 不太搭配，很多问题都是在 pnpm 上出现的

在执行 build 之间先将旧的 .next 构建删除掉
