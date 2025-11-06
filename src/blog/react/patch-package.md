---
title: 如何修改第三方包
pubDate: 2025-02-11
description: 使用 pnpm patch 命令修改第三方包源码，解决包版本兼容性问题
tags:
  - 其它
---

## Table of contents

## 如何修改第三方包

**核心就是使用 `pnpm patch`，所以必须使用 pnpm 管理项目**

这里以 `rehype-pretty-code` 为例，其中使用的 `shiki` 的 API 已在 2.x 被废弃

解决办法是回退到 1.x，或者使用新的 API `createHighlighter` 来替换旧 API `getHighlighter`

这里使用 `pnpm patch` 来修改 `rehype-pretty-code` 的代码，具体操作如下：

- 项目根目录执行 `pnpm patch rehype-pretty-code`
- 然后可以看到终端给出了提示，大致意思就是去 `xxx\node_modules\.pnpm_patches\rehype-pretty-code@0.14.0` 修改代码

```bash
PS 项目路径> pnpm patch rehype-pretty-code
Patch: You can now edit the package at:

  项目路径\node_modules\.pnpm_patches\rehype-pretty-code@0.14.0 (​file://项目路径\node_modules\.pnpm_patches\rehype-pretty-code@0.14.0​)

To commit your changes, run:

  pnpm patch-commit "项目路径\node_modules\.pnpm_patches\rehype-pretty-code@0.14.0"
```

- 这里直接去找 `index.js` 修改，然后执行 `pnpm patch-commit "xxx\node_modules\.pnpm_patches\rehype-pretty-code@0.14.0"` 将改动进行 patch 提交，
- 此时就可以看到项目目录下生成了 `patches` 文件夹，且 `package.json` 中也添加了 patch 文件的指向

```json
  "pnpm": {
    "patchedDependencies": {
      "rehype-pretty-code": "patches/rehype-pretty-code.patch"
    }
  }
```
