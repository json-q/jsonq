---
title: 多端项目整合为 monorepo
pubDate: 2026-03-08
description: 将 web 管理端和 Taro 小程序端整合为 monorepo
tags:
  - 开发
---

由于几年前的项目需要进行需求迭代，但是迭代功能和重写基本差不多，当时这个项目主要由我负责，所以这次就顺带准备将 web 管理端和小程序端整合在一起，原因如下：

两端的接口共用一套，此时就会造成：一个需求变动 -> 后台更改 -> 接口更改 -> web 端 ts 类型变动 -> 小程序端 ts 类型变动。

这种情况是最简单不涉及业务数据二次处理的，复杂的也不少，而且两端同时拥有很多通用方法，当时是直接 cv 到小程序端（Taro）的

## Table of contents

## api 层单独抽离

设计上是这么想的：由 `api` 包对接与后端的接口，而 web 侧和 mini 侧只需要调用接口函数就可以，完全不需要关心接口地址和返回参数，因为这些都在 api 侧统一处理

### 如何统一 axios 和 Taro.request

最开始遇到的就是这个问题：axios 是基于 XHR 的，而小程序端显然没有这个浏览器 API，因此无法只通过一套接口代码来完成请求函数

> [@tarojs/plugin-http](https://github.com/NervJS/taro/blob/main/packages/taro-plugin-http/README.MD) 是可以使 axios 在小程序端运行的插件（强绑定 webpack），但是个人感觉没必要，因为小程序的主包体积本身就很宝贵，axios 的体积也不小，并不会给开发带来很明显的收益。为了避免不必要的引入，所以决定利用 `Taro.request` 封装即可。

设计思路：

- 分别提供 web 和小程序的请求实例，分别让两端消费使用，类似于 `createWebHttpInstance` 和 `createMiniHttpInstance`
  - 请求单例模式来保证 web 侧的 instance 和小程序侧的 instance 分别唯一
  - 提供自定义错误处理，比如鉴权失败的回调`onUnAuth`、请求失败的回调`onRequestError`、超时回调`onTimeout`，错误处理交给使用侧，减少与框架的耦合
- 基于请求单例来封装 api 接口的请求函数
- 分别导出 web 侧和小程序侧的请求函数，比如从 `apis/web` 引入的就是 web 侧的请求函数，从 `apis/mini` 引入的就是小程序侧的请求函数

最终定下来的 api 包的目录结构如下：

```bash
.
├── src
│   ├── adapter # 存放 web 和小程序的对应的 http 请求核心函数(axios 和 Taro.request)
│   │   ├── web.ts # web 请求实例创建
│   │   └── mini.ts # 小程序请求实例创建
│   ├── api-constants # 对接后端接口：接口地址 url、ts 类型
│   ├── apis
│   │   ├── mini # 小程序端接口函数
│   │   ├── web # web 端接口函数
│   └── config # 与后端约定的状态码及请求头等
├── index.ts # 核心 instance 创建函数及公共约定参数
└── web.ts # web 调用 api 函数接口的入口文件
└── mini.ts # 小程序调用 api 函数接口的入口文件
```

`package.json` 导出

```json
{
  "name": "@@my-repo/api",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./web": {
      "types": "./src/web.ts",
      "default": "./src/web.ts"
    },
    "./mini": {
      "types": "./src/mini.ts",
      "default": "./src/mini.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "check": "biome check --write",
    "format": "biome format --write"
  },
  "peerDependencies": {
    "axios": "^1.13.6",
    "@tarojs/taro": "^3.6.39"
  },
  "peerDependenciesMeta": {
    "axios": {
      "optional": true
    },
    "@tarojs/taro": {
      "optional": true
    }
  }
}
```

这里 `package.json` 中比较有意思的就是 `peerDependenciesMeta` 字段，这个字段可以告诉 npm，这个依赖包是可选的，如果使用侧没有安装这个包也是可行的.

因为 web 侧不会使用 `@tarojs/taro` 这个包，而小程序侧也不会使用 `axios`

### 基础使用

例如 web 侧需安装 axios，然后创建 webInstance 实例

```ts
import { RequestEnum, createWebHttpInstance } from "@my-repo/api";
import { fetchUserInfo } from "@my-repo/api/web";

createWebHttpInstance({
  // 接受 axios 的所有配置项
  baseURL: "xxx",
  withCredentials: true,

  onDataError(_, data) {
    message.error(data.msg || "请求失败");
  },
  onRequestError(_, errMsg) {
    message.error(errMsg);
  },
  onTimeout() {
    message.error("请求超时，请稍后再试");
  },
  onUnAuth() {
    // to Login
  },
});

// Usage
fetchUserInfo().then((res) => {
  console.log(res);
});
```

## biome monorepo 集成

极快的 formatter 和 linter，我还是很喜欢 biome 的，而且其 v2 版本本身就支持 monorepo，[Use Biome in big projects](https://biomejs.dev/guides/big-projects/)，所以集成还是很简单的

## turborepo 集成

使用 turborepo 来管理多项目的任务调度，dev build check 等，上手也快

`package.json`

```json
{
  "scripts": {
    "check": "turbo run check",
    "typecheck": "turbo run typecheck"
  }
}
```

`turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    },
    "check": {
      "dependsOn": ["^check"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

## 关于 Taro 的看法

### Taro 的推荐程度

如果是新项目，个人并不会再推荐 Taro，真为了 react 而选择 Taro，用 v3 就行，v4 的 bug 太多，而且目前处于基本无人维护的状态。

维护力度：

老实说，很难评价 Taro 还能活多久，当时选择 Taro 就是看中了支持 React 的能力，而且维护也是比较积极的，当时因为一个需求在使用 Taro 过程中出现了问题，还提了一个 issue，修复也算快，可惜来年（24 年）维护力度骤降。

社区活跃度：

Taro 的社区基本没眼看，活跃度太低了，能用的组件库屈指可数。此时就不得不提一嘴 uniapp 了，虽然社区产出的垃圾一堆，但是胜在量多，总会有几个大佬能做出好用的东西。

### Taro webpack 的迁移尝试

Taro v3 使用 webpack 构建，v4 虽然支持了 vite（实际就是大号的 rollup，并没有 vite 的能力，而且 vite 版极不稳定）

个人有切换为 Rspack 的尝试，因为 webpack 构建速度太慢，但是遇到了无法兼容的问题：Taro 的 webpack5-runner 中用到了 Webpack 的 `Dependency` 类，而 Rspack 完全没有实现这个类，导致迁移最终失败，没招了，只能接着带着 webpack 玩了。
