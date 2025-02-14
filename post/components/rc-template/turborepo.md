---
title: 从零到一构建并打包 React + TypeScript + Less组件库系列（三、turborepo 集成）
date: 2024-11-14 15:32
---

点击查看此次 [commit](https://github.com/json-q/rc-library-templete/commit/ce05a078ffce16f01e1c622a9f2cbf8ac7a1f5e5)

[`turborepo`](https://turbo.build/repo/docs) 就是专门做构建用的，对于 `monorepo` 项目来说更适合，构建缓存等可以大大优化开发体验。如果只是基本使用，甚至可以把它当作一个大号的 [`npm-run-all2`](https://www.npmjs.com/package/npm-run-all2)，基本功能会用就行，这里不过多介绍相关细节知识，大家自行探索。

# 初始集成 turborepo

```bash
pnpm i turbo -D -w
```

根目录新建 `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["tsconfig.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        ".next/**",
        "storybook-static/**",
        "!.next/cache/**",
        "dist/**",
        "es/**",
        "lib/**"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

- dependsOn

这里以 `build` 为例，`dependsOn` 的数组就是执行命令的先后顺序，如果你想让执行 `turbo run build` 时先执行 `lint` 接着再 `build`，就可以将 `dependsOn` 写成 `["lint", "build"]`

- denpendsOn 中的 `^`

比如 storybook build 时，需要 icons build 和 components build 完成之后再执行，而不是单纯的只 build 自己，那就需要在 `dependsOn` 中配置 `^` 符号来明确依赖关系。

然后检查目前在 workspace 里的 `build` `dev` 命令

```json
// components

  "scripts": {
    "dev": "gulp watch",
    "build": "npm run clean:build && npm run build:types && gulp && npm run build:dist",
    "clean": "rimraf .turbo node_modules",
    // ...
  },

// storybook
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "clean": "rimraf .turbo node_modules storybook-static"
    // ...
  },
```

在根目录的 `package.json` 中添加统一执行命令

```json
  "scripts": {
    // ...
    "turbo:dev": "turbo run dev",
    "turbo:build": "turbo run build",
    "turbo:clean": "turbo run clean",
    "turbo:lint": "turbo lint",
    // ...
  },
```

- 执行 `pnpm turbo:dev` 一键启动所有的 `dev` 命令，甚至不需要关心启动顺序
- `pnpm turbo:clean` 一键删除 workspace 下的相关目录文件
