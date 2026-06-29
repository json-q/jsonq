---
title: vue-element-admin 迁移至 rsbuild v1
pubDate: 2026-06-20
description: 将 vue-element-admin(vue-cli 4) 迁移到 rsbuild v1
tags:
  - 开发
  - vue
---

本文旨在尽量兼容现有开发环境的情况下，将 vue-cli 4 迁移至 rsbuild v1。

# vue-element-admin 迁移到 rsbuild v1

最近接触到一个老旧项目，使用的是 vue-element-admin，习惯了 vite 和 rspack 这类 Rust 构建工具，webpack 作为老牌构建工具开发体验实在是一言难尽，本文将直接从 fork 的 vue-element-admin 仓库开始，将项目迁移到 rsbuild v1。

为什么是 rsbuild v1 而不是 v2？

为了确保开发及构建环境不会存在大的变动（说白了减少升级带来的负担），采用 rsbuild v1.4（node>=16.10.0），因为 v1.5 需要 node 18 及以上，而目前此项目使用的 node14 在 jenkins 上进行的构建，node 14 升级到 Node18 会有很多的兼容性问题，而升级到 16 则基本可以平滑升级。[详见 rsbuild 环境](https://v1.rsbuild.rs/zh/guide/start/quick-start#%E7%8E%AF%E5%A2%83%E5%87%86%E5%A4%87)

如果觉得文章过长，也可以直接查看 [vue-element-admin-rsbuild](https://github.com/json-q/vue-element-admin-rsbuild) 的 [commit](https://github.com/json-q/vue-element-admin-rsbuild/commit/ce7bf121415c6c2bc23ec4f25e115f4d4a10221b) 记录查看变更差异。

## 环境准备

- 升级 node 版本 node>=16.10.0
- 遵循 [vue cli 迁移](https://v1.rsbuild.rs/zh/guide/migration/vue-cli) 开始操作

## 迁移步骤

基本遵循官方文档的迁移步骤，但是官方迁移的教程太简陋了，因此会增加大量需要注意的说明

**未标注版本号的依赖可以直接安装，标注版本的则必须安装对应版本**

### 安装依赖

移除 vue-cli 依赖

```bash
npm remove @vue/cli-service @vue/cli-plugin-babel @vue/cli-plugin-eslint core-js
```

安装 rssbuild 依赖。

- `@rsbuild/core` **必须锁定** 1.4.16 版本，这是最后一个支持 node16 的版本
- `@rsbuild/plugin-vue2` **必须锁定** 1.0.6 版本，这是最后一个支持 rsbuild v1 的版本。

```bash
npm i @rsbuild/core@1.4.16 @rsbuild/plugin-vue2@1.0.6 -DE
```

升级 vue 版本至 2.7.16，因为 rsbuild 的 vue2 插件仅支持 2.7.0 及以上版本。

```bash
npm i vue@2.7.16 vue-template-compiler@2.7.16 -E
```

安装 vue2 jsx 插件 babel 插件。vue-element-admin 使用了 [vue2 jsx](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/layout/components/Sidebar/Item.vue#L15-L30) 语法，而解析 jsx 需要 babel 插件。

```bash
npm i @rsbuild/plugin-vue2-jsx @rsbuild/plugin-babel@1.2.1 -DE
```

安装 sass 插件，因为 vue-element-admin 使用了 scss 语法

```bash
npm i @rsbuild/plugin-sass -D
```

安装 node polyfill 插件。原因是 webpack 5 之前默认 polyfill Node 内置，而 [HeaderSearch](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/components/HeaderSearch/index.vue#L24)、[Sidebar](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/layout/components/Sidebar/SidebarItem.vue#L28) 等组件多处使用。

```bash
npm i @rsbuild/plugin-node-polyfill -D
```

### 配置 rsbuild

根目录新增 `rsbuild.config.mjs` 文件，将安装的 rsbuild 插件集成到配置里。

由于 vue-element-admin 使用了很多 commonjs 语法，为了减少改动，package.json 不添加 `type: module`，相应的，rsbuild.config 要以 mjs 结尾。

```js
import { defineConfig } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginVue2 } from "@rsbuild/plugin-vue2";
import { pluginVue2Jsx } from "@rsbuild/plugin-vue2-jsx";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginVue2(),
    pluginVue2Jsx(),
    pluginSass(),
    pluginNodePolyfill(),
  ],
});
```

## 迁移 vue cli 配置

### 环境变量

vue-cli 环境变量默认以 `VUE_APP_` 开头在代码中使用，使用 rsbuild 的 [loadEnv](https://v1.rsbuild.rs/zh/api/javascript-api/core#loadenv) 配置项进行兼容即可。

```js
// https://v1.rsbuild.rs/zh/guide/advanced/env-vars#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%89%8D%E7%BC%80
const { publicVars } = loadEnv({ prefixes: ["VUE_APP_"] });

export default defineConfig({
  source: {
    // 指定入口文件
    entry: {
      index: "./src/main.js",
    },
    // 声明环境变量
    define: publicVars,
  },
});
```

### html 模板

```js
import defaultSettings from "./src/settings.js";
const name = defaultSettings.title || "vue Element Admin"; // page title

export default defineConfig({
  html: {
    template: "./public/index.html",
    title: name,
    // 如果 name 还在除了 <title> 标签外，请添加 templateParameters 配置
    // templateParameters: {
    //   name: "world",
    // },
  },
});
```

将 `<title><%= webpackConfig.name %></title>` 去掉，修改 `<link rel="icon" href="<%= BASE_URL %>favicon.ico">`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="renderer" content="webkit" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <link rel="icon" href="<%= assetPrefix %>/favicon.ico" />
  </head>
  <body>
    <div id="app"></div>
    <!-- 以下是一个非 <title> 标题使用了 webpackConfig.name 的例子： -->
    <!-- 如果非标题也使用了 webpackConfig.name，请先添加 templateParameters 配置变量，然后将 webpackConfig.name 改为 name  -->
    <!-- <noscript>
      <strong>
        We're sorry but <%= name %> doesn't work properly without JavaScript
        enabled. Please enable it to continue
      </strong>
    </noscript> -->
    <!-- built files will be auto injected -->
  </body>
</html>
```

### 配置 devServer

vue cli `devServer` 对应 rsbuild 的 `server`，`devServer.overlay` 对应的是 rsbuild 的 `dev.client.overlay`，默认启用错误时的内容提示，因此可以安全将 `devServer.overlay` 配置项移除

```js
const port = process.env.port || process.env.npm_config_port || 9527; // dev port

export default defineConfig({
  server: {
    port: port,
    open: true,
  },
});
```

#### 迁移 mock server

rsbuild 中没有直接对应 `devServer.before` 配置项，但是 rsbuild 提供了 `setupMiddlewares` 可以进行 mock 配置，详见 [集成第三方服务端框架](https://v1.rsbuild.rs/zh/guide/basic/server#%E9%9B%86%E6%88%90%E7%AC%AC%E4%B8%89%E6%96%B9%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%A1%86%E6%9E%B6)

根据官网的介绍，需要先安装 express，不能安装 express v5 版本。v5 需要 node>=18。

```bash
npm i express@4.22.2 -DE
```

```js
import express from "express";
import mockServerMiddleware from "./mock/mock-server";

export default defineConfig({
  dev: {
    setupMiddlewares: (middlewares) => {
      // 一定要在这里初始化，否则在打包时会执行到 mock-server 的 chokidar.watch() 导致进程无法退出
      const app = express();
      mockServerMiddleware(app); // mock-server.js 需要接收一个 app
      middlewares.unshift(app);
    },
  },
});
```

### 配置 alias

```js
export default defineConfig({
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
```

### 构建配置

以 vue-element-admin 来说，以下配置都不需要，因为都是默认配置，如果有大量自定义的配置，那就需要看一下官方文档的对应 api 了。

```js
export default defineConfig({
  output: {
    distPath: {
      root: "dist",
    }, // 对应 outputDir: 'dist'，可删除，rsbuild 默认配置
    assetPrefix: "/", // 对应 publicPath: '/'

    // 对应 assetsDir 其实和 rsbuild 的默认 assets 输出一致，可以不用新增保持默认配置也行
    // https://v1.rsbuild.rs/zh/config/output/dist-path#outputdistpath
    // distPath: {
    //   js: 'static/js',
    //   css: 'static/css',
    //   image: 'static/img',
    //   font: 'static/fonts'
    // }

    // 对应 productionSourceMap，可不添加，保持 rsbuild 默认配置即可。
    // sourceMap: {
    //   js: process.env.NODE_ENV === 'development' ? 'cheap-module-source-map' : false,
    //   css: false
    // },
  },
});
```

### chainWebpack

从 [chainWebpack](https://github.com/PanJiaChen/vue-element-admin/blob/master/vue.config.js#L51-L123) 从上往下配置慢慢过一遍。

#### preload 配置

对应 [源码](https://github.com/PanJiaChen/vue-element-admin/blob/master/vue.config.js#L54-L62)

```js
export default defineConfig({
  performance: {
    preload: {
      type: "initial", // include: 'initial'
      exclude: [/\.map$/, /hot-update\.js/, /runtime\..*\.js$/], // fileBlacklist
    },
  },
});
```

#### prefetch

element vue admin 关闭了 prefetch，对应 [源码](https://github.com/PanJiaChen/vue-element-admin/blob/master/vue.config.js#L65)

在 rsbuild 中，不需要添加和删除任何东西，因为 [prefetch](https://v1.rsbuild.rs/zh/config/performance/prefetch#performanceprefetch) 在 rsbuild 中默认是关闭的。

#### SVG sprite-loader

对应 [源码](https://github.com/PanJiaChen/vue-element-admin/blob/master/vue.config.js#L68-L82)。

使用 rsbuild 的 `tools.bundlerChain` 即可，基本完全不用改动。

> 不能使用 `tools.webpackChain`，因为这个 api 看似是兼容 webpack 的，但其实是依赖 webpack 的， rsbuild 默认使用的是 rspack，此 api 不会生效，官方文档也没有对其相关的说明，仅作为 modern.js 内部的兼容使用。

```js
import { resolve } from "node:path";

export default defineConfig({
  tools: {
    bundlerChain: (chain) => {
      chain.module.rule("svg").exclude.add(resolve("src/icons")).end();
      chain.module
        .rule("svg-icons")
        .test(/\.svg$/)
        .include.add(resolve("src/icons"))
        .end()
        .use("svg-sprite-loader")
        .loader("svg-sprite-loader")
        .options({
          symbolId: "icon-[name]",
        });
    },
  },
});
```

#### runtime 的 js 文件内联

对应 [源码](https://github.com/PanJiaChen/vue-element-admin/blob/master/vue.config.js#L84-L95)

可以使用 rsbuild 的 [`output.inlineScripts`](https://v1.rsbuild.rs/zh/config/output/inline-scripts#outputinlinescripts) 配置

```js
export default defineConfig({
  html: {
    inject: "body", // https://v1.rsbuild.rs/zh/config/output/inline-scripts#outputinlinescripts
  },
  output: {
    inlineScripts: {
      enable: "auto",
      test: /[\\/]runtime\.\w+\.js$/,
    },
  },
});
```

#### splitChunks

对应 [源码](https://github.com/PanJiaChen/vue-element-admin/blob/master/vue.config.js#L95-L118)

可使用 rsbuild 的 [`performance.splitChunks`](https://v1.rsbuild.rs/zh/config/performance/chunk-split#chunksplitsplitchunks) 配置

```js
export default defineConfig({
  performance: {
    splitChunks: {
      strategy: "custom",
      splitChunks: {
        cacheGroups: {
          libs: {
            name: "chunk-libs",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: "initial",
          },
          elementUI: {
            name: "chunk-elementUI",
            test: /[\\/]node_modules[\\/]_?element-ui/,
            priority: 20,
          },
          commons: {
            name: "chunk-commons",
            test: /src[\\/]components[\\/]/,
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    },
  },
});
```

### runtimeChunk

对应 [源码](https://github.com/PanJiaChen/vue-element-admin/blob/master/vue.config.js#L120)

这个在 rsbuild 没有直接对应的 api，但是 rspack 兼容 webpack，因此可以使用 rspack 的 api 进行配置。

```js
export default defineConfig({
  tools: {
    rspack: (config) => {
      config.optimization.runtimeChunk = "single";
    },
  },
});
```

至此，配置迁移完毕，接下来进行运行测试。

## 运行测试

### 更新 script

移除 vue-cli 对应的脚本命令，新增 rsbuild 命令

```json
{
  "serve": "rsbuild dev",
  "build:prod": "rsbuild build",
  "build:stage": "rsbuild build --env-mode staging",
  "preview": "rsbuild preview"
}
```

### 移除无用依赖

由于使用 rsbuild，部分依赖 vue-cli 的依赖或者 webpack 的 loader 依赖可以安全移除。

如果你不移除以下依赖，这些依赖在安装时会将 webpack@4 版本带入项目，而 rsbuild 兼容的是 webpack@5，运行会报错的。

```bash
npm remove html-webpack-plugin script-ext-html-webpack-plugin @vue/cli-plugin-unit-jest sass-loader
```

移除后，大概率需要删除 `package-lock.json` 和 node_modules 重新安装依赖。仅删除 node_modules 可能存在部分遗留的依赖引用

删除 `.babelrc` 中的 `@vue/cli-plugin-babel` 配置，因为此依赖已经被移除了，由 rsbuild 进行 babel 转义

### 运行项目并排查代码报错

运行 `npm run serve` 启动项目，可能会出现如下错误：

![image](https://jsonq.top/cdn-static/2026/0620260620021103360.png)

这个看起来像是 jsx 语法 Babel 插件没识别到，手动在报错文件的 script 添加 `lang="jsx"` 就解决了。

下一个报错：

![image](https://jsonq.top/cdn-static/2026/0620260620021517385.png)

这个错误是将 sass 的 `:export` 样式作为 js 进行使用，而正常情况下，这种应用方式只允许 css module 使用。

如果你直接将对应文件改成 `.module.scss` 结尾并更新相关导入，其实会发现是有问题的。因为 `element-variables.scss` 引入了 element-ui 的样式，而且也使用了 `:export` 语法，css module 会将 element-ui 的样式进行 scope，**导致 element-ui 的样式失效**。

将 `element-variables.scss` 拆分：

![image](https://jsonq.top/cdn-static/2026/0620260620145150933.png)

```scss
// _theme-vars.scss
$--color-primary: #1890ff;

// element-variables.scss 删除 :export 部分，导入 _theme-vars.scss，其它保持不变
@import "./theme-vars";

// element-variables.module.scss
@import "./theme-vars";

:export {
  theme: $--color-primary;
}
```

element-ui 的样式搞定了，还有一个 [Sidebar](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/layout/components/Sidebar/index.vue#L25) 组件中使用了 `variable.scss` 作为 js，这个 css 可以安全的改为 `.module.scss` 后缀并更新导入即可，因为不涉及 css 样式，是纯 scss 变量，不影响。

此时运行项目，应该没有报错了。

### 其它可能出现的代码报错

由于当前迁移是完全使用 vue-element-admin 源码迁移，但实际项目可能对其进行各种扩展改造，因此不一定会遇到什么问题，这些报错基本都属于代码层写法问题，通过 ai 可以很方便进行定位解决。此处列举几个常见的报错。

#### 后端路由数据动态注册前端路由

常规后台管理系统，前端路由通过后端返回的数据进行动态注册

```js
// 动态 require 路由，伪代码
item.component = (resolve) =>
  require([`@/views${item.path ? item.path : ""}`], resolve);

// 需改为
item.component = () => import(`@/views${item.path ? item.path : ""}`);
```

#### 深度选择器

`>>>` 这种写法在 sass 预处理器中可能不被支持，需替换为正常 vue 写法 `::v-deep`（已废弃但可用，会有警告） 或 `/deep/` 或 `:deep()`（推荐）

css 警告如果工作量较大，可以忽略，也可以交给 ai 来批量处理。

## 吐槽

老实说，vue-element-admin 在 20 年那时候确实惊艳，但是放到现在就有点破产了，而且这篇文章其实没什么受众。

如果一个公司愿意用原本的技术栈不变始终码代码，那大概率也不会关心开发体验问题，主打一个能跑就行，这部分人也基本不会选择冒险进行构建工具升级迁移的，所以这篇迁移教程定位其实挺尴尬的，基本属于白写。
