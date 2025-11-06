---
title: TS 语法扩展
pubDate: 2024-05-03
description: TypeScript 模块化使用、类型兼容性、声明文件及命名空间等高级语法
tags:
  - typescript
---

## Table of contents

## TS 模块化

### TS 模块化使用

TypeScript 中最主要使用的模块化方案就是 ES Module，即 `import/export`

**非模块**

- JavaScript 规范声明任何**没有 export 的 JavaScript 文件都应该被认为是一个脚本，而非一个模块**。
- 在一个脚本文件中，**变量和类型会被声明在共享的全局作用域**，将多个输入文件合并成一个输出文件，或者在 HTML 使用多个 `<script>` 标签加载这些文件。
- 如果有一个文件，现在没有任何 `import` 或者 `export`，但是希望它被作为模块处理，添加这行代码：`export {}`

**内置类型导入**

使用 `type` 前缀 ，表明被导入的是一个类型：

```ts
import type { PersonType } from "./types";

const p: PersonType = {};
```

> 使用 `type` 可以使非 TypeScript 编译器比如 Babel、swc 或者 esbuild 知道什么样的导入可以被安全移除

**命名空间 namespace**

```ts
// 不使用 export ，默认就是全局
namespace API {
  export interface TableData {
    // ...
  }
}

const data: API.TableData = fetch("...");
```

### 内置类型声明

**类型的查找**

typescript 文件：`.d.ts`文件

- 正常编写的 `.ts` 文件，最终都会被编译成 js 文件
- `.d.ts` 文件，它是用来做类型的声明(declare)，称之为类型声明或者类型定义文件。**它仅仅用来做类型检测，告知 typescript 有哪些类型的声明**

**内置类型声明**

内置类型声明是 typescript 自带的、内置了 JavaScript 运行时的一些标准化 API 的声明文件

- 包括比如`Function`、`String`、`Math`、`Date`等内置类型；
- 也包括运行环境中的 DOM API，比如`Window`、`Document`等；
- TypeScript 使用模式命名这些声明文件 `lib.[something].d.ts`

内置类型声明通常在安装 typescript 的环境中会带有的：https://github.com/microsoft/TypeScript/tree/main/lib

**内置声明的环境**

开发者可以通过`tsconfig.json` 中的 `target` 和 `lib` 来决定哪些内置类型声明是可以使用的

- 例如，`startsWith` 字符串方法只能从称为 ECMAScript 6 的 JavaScript 版本开始使用
- 可以通过 target 的编译选项来配置：TypeScript 通过 lib 根据自己的 target 设置更改默认包含的文件来帮助解决此问题。

> https://www.typescriptlang.org/tsconfig#lib

```bash
npm i webpack webpack-cli -D
npm i ts-loader -D
npm i html-webpack-plugin -D
npm i webpack-dev-server -D

tsc --init
```

```js
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

moudle.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(_dirname, './dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js', '.cjs', '.json'],
  },
  devServer: {
    post: 3000,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugin: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};


// package.json

"scripts": {
    "serve": "webpack serve",
    "build": "webpack"
},

// tsconfig.json
{
  "compilerOptions":{
    "target": "ES2020",
    "lib":["DOM"]  // lib [] 指不指定任何包
  }
}
```

#### 外部定义声明

**第三方库**

- 外部类型声明通常是我们使用一些库（比如第三方库）时，需要的一些类型声明。
- 这些库通常有两种类型声明方式：
- 方式一：在自己库中进行类型声明（编写.d.ts 文件），比如 axios
- 方式二：通过社区的一个公有库 DefinitelyTyped 存放类型声明文件
  - 该库的 GitHub 地址：https://github.com/DefinitelyTyped/DefinitelyTyped/
  - 该库查找声明安装方式的地址：https://www.typescriptlang.org/dt/search
  - 比如安装 react 的类型声明： `npm i @types/react --save-dev`

**自定义声明**

当引入的第三方库没有 @types/... 声明文件，而 TS 又需要该模块，可以使用自定义声明文件

```ts
// .ts
import Nprogress from "nprogress";

// .d.ts
declare module nprogress {
  easing: string;
  speed: number;
  // ...
}
```

**declare 声明模块**

```ts
declare module "npreogress" {
  export function test() {
    // ...
  }
}

// 声明的变量可以全局访问
declare const name: string;
```

**declare 声明文件**

- 比如在开发 vue 的过程中，默认是不识别 `.vue` 文件的，那么我们就需要对其进行文件的声明
- 比如在开发中使用了 `jpg` 这类图片文件，默认 typescript 也是不支持的，也需要对其进行声明

```ts
declare module "*.vue";

declare module ".jpg";

// 如果 webpack 报错没有合适的 loader 对图片进行处理
// webpack.config.js
module: {
  rules: [
    // ...
    {
      test: /\(png|jpe?g|svg|gif)$/,
      type: "asset/resource",
    },
  ];
}
```

**declare 命名空间**

- 比如在 index.html 中直接引入了 jQuery：
  - CDN 地址： https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js

```ts
declare namespace ${
  export ajax(seetins: any):void
}

$.ajax({
  url:"http://xx"m
  success:(res:any)=>{
    console.log(res)
  }
})
```

### tsconfig.json

可以查看文档对于每个选项的解释：https://www.typescriptlang.org/zh/tsconfig

常用配置

```json
{
  "compilerOptions": {
    "target": "esnext", // 使用何种 es 代码编译，esnext 表示 es 的最新版本
    "module": "exnext", // 生成代码使用的模块化
    "strict": true, // 打开所有的严格模式检查，打开为 true 相当于把模糊 any、this 等等都打开了
    "noImplicitAny": true, // 不允许模糊的 any
    "allowJs": false, // 允许写 js 文件
    "jsx": "preserve", // jsx 的处理方式，"react"|"react-jsx" 有babel使用默认即可
    "importHelpers": true, // 帮助导入一些需要的功能模块，类似打包的时候自动打补丁
    "moduleResolution": "node", // 按照 node 的模块规则
    "skipLibCheck": true, // 跳过对整个库进行类似检测，而仅仅检测用到的类型
    "esModuleInterop": true, // 让 es module 和 commonjs 相互调用
    // import * as react from "react"  false
    // import react from "react"  true
    "allowSyntheticDefaultImports": false, // 允许默认合成导出
    "sourceMap": false, // 生成 sourceMap 文件
    "baseUrl": "./", // 文件路径在解析时的基本 url
    "paths": {
      // 路径的映射设置，类似于 webpack 中的 alias
      "@@/*": [".dumi/tmp/*"]
    },
    "lib": ["ESNext", "DOM", "DOM.Iterable", "ScriptHost"] // 指定需要使用到的库，也可以不配置，直接根据 target 来获取
  },
  // 用于指定在项目中包括哪些文件需要编译
  "include": [".dumi/**/*", ".dumirc.ts", "public/loading.js"],
  // 指定编译中排除的文件
  "exclude": []
}
```
