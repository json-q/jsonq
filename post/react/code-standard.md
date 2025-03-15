---
title: React 项目工程化搭建
date: 2023-06-23
---

# 前言

对于文章涉及的内容，可直接看总结，对工程化没了解的小白，若从头看到尾，也可以搭建出来。

本文章内的项目内容基于 `vite` + `react` + `ts` 搭建，但通篇并未涉及 react 的东西，所以可以通用。**适合新手入门的工程化项目规范，最小化的完成代码规范和 git 提交规范**，开发工具使用 vscode。

- 为什么是最小化？
  - 本意是为了让大家都能看懂入手这些规范，很多文章中，都长篇进行自定义的配置，其实这些自定义配置大部分时候都用不上，用上了再加就行，仅添加自己需要的东西，这就是这篇文章的思路。
  - 不对规范化配置做过多自定义约束，但又不会缺少工程化的常见规范，仅仅是对这些规范的增强

> 本来这些规范化的配置是 vue 和 react 通用的，不过，`vue3` 有自己的一套基于 `vite` 的 cli 脚手架，eslint 和 prettier 都已经配置，文章中部分就不需要再配置。

# eslint

<b style={{color:"red"}}>需安装 `ESlint` 插件</b>

vite 在安装 react 时就带了 eslint 的很多依赖，算是省去了对 eslint 的配置，其它脚手架可以参考 vite 的 eslint 规则进行配置。而且 esint 9 的变动挺大的，目前普及度并不高，此处用的还是 eslint^8。以下是对 eslint 的一些增强设置

## eslint 忽略校验的文件

新建 `.eslintignore` 文件，写入以下内容，自己想要忽略检测的也可以写入该文件。

```bash
*.sh
node_modules
dist
*.woff
*.ttf
.vscode
.idea
.husky
.local
/bin
mock

# cache
.eslintcache
.stylelintcache
```

## eslint 校验缓存

缓存是为了减少 eslint 的校验时间，若项目过于庞大，每次都对整个项目进行 eslint 校验是相对浪费时间的。

修改 `package.json`，在原命令的基础上添加 ` --fix --cache` 自动修复并缓存校验结果。

意思就是 eslint 检验 `ts,tsx` 文件，并尝试自动修复这些文件的错误，且 `warning` 警告级别的数目需要为 0（`error` 级别的必无法通过校验，也就是不能出现错误和警告），最终结果缓存到项目中，下次就可以忽略未变动的文件校验了。

```json
{
  "script": {
    "eslint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --fix --cache"
  }
}
```

### 自定义 eslint 规则

eslint 默认在 TS 中是不允许出现 `any`，但这不合理，毕竟就算写体操也是需要 `any` 的。在 `.eslintrc.cjs` 中添加以下内容：

```js
module.exports = {
  // ...
  rules: {
    // ...
    '@typescript-eslint/no-explicit-any': ['off'],
  },
};
```

就是关闭对 不允许 `any` 这个规则的校验，其它的约束如果不合理，也可以选择 `off` `warn` `error` 等不同等级。

![eslint 校验](https://jsonq.top/cdn-static/2025/02/25/1740465689712-lgds5v4x.png)

在写作的过程中，如果觉得有些规则没有必要，但是 eslint 给出了错误或警告提示，就可以根据提示去关闭这些 eslint 规则

# prettier

<b style={{color:"red"}}>需安装 `Prettier - Code formatter` 插件</b>

## 安装相关依赖

安装三个包 `prettier eslint-config-prettier eslint-plugin-prettier`

```bash
npm i prettier eslint-config-prettier eslint-plugin-prettier -D
# yarn add prettier eslint-config-prettier eslint-plugin-prettier -D
```

- prettier: 代码格式化插件，统一代码格式，效果同 vscode 插件 `prettier`
- eslint-config-prettier: 解决 eslint 和 prettier 中的规则冲突
- eslint-plugin-prettier: prettier 的格式化规则集成到 eslint 中，让 eslint 可以识别 prettier 的不规范写法，从而提示警告或者错误

## 配置 prettier

### 集成到 eslint 中

此处也可以结合文档进行配置：https://github.com/prettier/eslint-plugin-prettier

安装完成后，需要让 eslint 集成 prettier 的这些规则，让 eslint 可以提示给开发者 prettier 的不规范代码，在 `.eslintrc.cjs` 中添加如下内容：

```js
module.exports = {
  // ...
  extends: [
    // ...
    'plugin:prettier/recommended',
  ],
  rules: {
    // ...

    'prettier/prettier': 'warn', // 让 eslint 提示 prettier 错误格式的级别 warn | error
    'arrow-body-style': 'off', // eslint-plugin-prettier 建议关闭，原因可查看文档说明
    'prefer-arrow-callback': 'off',
  },
};
```

然后你就可以看到如下情况，eslint 提示了 prettier 的不规范代码：

![prettier 集成到 eslint](https://jsonq.top/cdn-static/2025/02/25/1740465689805-mvs86mbz.png)

**也可以看到 prettier 提示换行符的问题，几乎每个文件都有，此时就可以查看 <b style={{color:"red"}}>统一编码格式</b> 小节，接着跟流程也不影响**

## prettier 规则

如果每个人的 prettier 格式化规则不一样，也会导致代码风格迥异，此时为了统一项目的整体代码风格，可以在根目录新建 `.prettierrc` 文件，这样 vscode 会优先读取该文件下的配置

```json
{
  "semi": true,
  "singleQuote": false,
  "printWidth": 100,
  "jsxSingleQuote": false,
  "useTabs": false,
  "tabWidth": 2
}
```

配置的作用可自行百度，配置中没出现的就会使用 prettier 默认的配置项

> `semi`：使用单引号还是双引号，个人感觉双引号更规范一点

## 自动格式化修复

vscode 的 prettier 插件可以修改设置保存时自动格式化代码，但这种属于手操 vscode 设置，我们可以让使用者在不手动设置的情况下，来实现代码保存自动格式化并自动修复

在项目根目录新建 `.vscode` 文件夹，在文件夹下新建 `settings.json` 文件，写入如下内容

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit" // 保存时自动修复
  },
  "editor.formatOnSave": true, // 保存时自动格式化
  "editor.defaultFormatter": "esbenp.prettier-vscode", // 默认格式化插件使用 prettier
  "stylelint.validate": ["css", "less", "scss", "sass", "vue"] // stylelint 校验的文件类型
}
```

设置完这个，再次修改文件，然后保存时，就会自动修复一些 prettier 格式不规范的代码片段。

# stylelint

<b style={{color:"red"}}>需安装 `Stylelint` 插件</b>

## 安装 stylelint 及相关插件

安装五个插件（vue 可忽略 `css module` 插件）

```bash
npm i stylelint stylelint-config-standard stylelint-prettier stylelint-order stylelint-config-recess-order stylelint-config-css-modules -D
```

- stylelint: css 样式校验的基础插件
- stylelint-config-standard: stylelint 推荐的 css 校验规则
- stylelint-prettier: stylelint 和 prettier 的集成
- stylelint-order: css 排序，可自定义 css 排序规则
- stylelint-config-recess-order: 现成的 css 排序规则，不用再去手写，与之相似的还有一个 `stylelint-config-idiomatic-order`，但是相对来说，`recess-order` 更符合开发人员的 css 书写顺序
- stylelint-config-css-modules: 识别 `css module` 的样式（vue 可忽略）

## stylelint 配置

根目录下新建 `.stylelintrc` 文件，写入以下内容

```json
{
  "plugins": ["stylelint-order"],
  "extends": [
    "stylelint-config-standard",
    "stylelint-prettier/recommended",
    "stylelint-config-css-modules",
    "stylelint-config-recess-order"
  ]
}
```

此时新建一个 css 文件，写入一些内容

![验证 stylelint 工作](https://jsonq.top/cdn-static/2025/02/25/1740465689909-tmv21g2p.png)

可以看到，stylelint 已经对 css 的排序进行了校验，顺序不对的情况下会给出提示，但由于我们在 `settings.json` 中配置了自动修复，所以保存该文件时，vscode 会自动对这些 css 样式进行排序修复的，既避免开发人员一直在 css 的顺序上浪费时间，也统一了 css 代码风格

## stylelint 忽略部分文件的校验

新建 `.stylelintignore` 文件，不校验 js jsx 等文件

```bash
**/*.js
**/*.ts
**/*.tsx
**/*.jsx

node_modules
dist
```

## 集成 less

vite 的特殊处理，不需要像 `webpack` 那样安装 `less-loader`，安装 less 即可使用。

```bash
npm i less postcss-less -D
```

由于 stylelint 无法理解部分 less 的部分语法，所以可能会识别为错误语法，为了防止这种情况，需要安装 `postcss-less`，并在 `.stylelintrc` 中添加如下内容：

```json
{
  "plugins": [
    /* ... */
  ],
  "extends": [
    /* ... */
  ],
  "customSyntax": "postcss-less"
}
```

在 `package.json` 中添加 `stylelint` 校验命令

```json
{
  "scripts": {
    // ...
    "eslint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --fix --cache",
    "stylelint": "stylelint \"**/*.{less,css,scss}\" --fix --cache"
  }
}
```

由于之前在 `settings.json` 中配置了如下内容，所以 stylelint 也可以正常识别 less，并对其 css 规范进行约束。

```json
{
  // ...
  "stylelint.validate": ["css", "less", "scss", "sass", "vue"]
}
```

![stylelint 排序校验](https://jsonq.top/cdn-static/2025/02/25/1740465690004-ho45s89u.png)

## 集成 postcss autoprefixer 实现自动添加浏览器前缀

```bash
npm i postcss autoprefixer -D
```

新建 `postcss.config.js`，启用 `autoprefixer` 插件

```js
export default {
  plugins: {
    autoprefixer: {},
  },
};
```

![autoprefixer 用处](https://jsonq.top/cdn-static/2025/02/25/1740465690097-bqptkwbt.png)

# 提交规范

这里使用的提交和大众稍微不同，既没有 `husky`，也没有 `commitlint`

- 使用 `pretty-quick` 进行代码提交前的自动格式化，可参考 [官方文档](https://github.com/prettier/pretty-quick#readme)
- 使用 `simple-git-hooks` 进行类 `husky` 的提交方式。该插件同样在 [vuejs](https://github.com/vuejs/core/blob/main/package.json) 中使用

## 安装相关插件

```bash
npm i pretty-quick simple-git-hooks -D
```

### 配置 git 提交校验

`package.json` 配置

```json
{
  "scripts": {
    // ...
    "eslint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --fix --cache",
    "stylelint": "stylelint \"**/*.{less,css,scss,vue}\" --fix --cache",
    "postinstall": "simple-git-hooks"
  },
  "simple-git-hooks": {
    "pre-commit": "npx pretty-quick --staged && npm run eslint && npm run stylelint",
    "commit-msg": "node scripts/verify-commit.js"
  }
}
```

#### simple-git-hooks 简单介绍

`simple-git-hooks` 中

- `pre-commit` 是代码 commit 提交前预先对代码进行校验，格式化代码、eslint 校验、stylelint 校验，校验不通过的不允许提交
- `commit-msg` 是对 commit 的信息进行校验，执行 scripts 文件夹下的 `verify-commit.ts`，可以参考 [vuejs](https://github.com/vuejs/core/blob/main/package.json) 对 `simple-git-hooks` 的用法

#### simple-git-hooks 初始化

`postinstall` 是让项目在初次安装过程完成时自动执行 `npx simple-git-hooks` 命令。如果初次没有执行，需手动执行该命令，不执行的话没有 git hook 的钩子校验。

npx 手动初始化

![npx 手动初始化](https://jsonq.top/cdn-static/2025/02/25/1740465690197-inknzxzh.png)

git 拉取下来安装时自带 .git 文件，会自动执行 `postinstall` 命令进行初始化

![自动初始化](https://jsonq.top/cdn-static/2025/02/25/1740465690297-gg4gsof4.png)

### 对 git commit 的信息进行校验

先安装 `@types/node`

```bash
npm i @types/node -D
```

在 `scripts` 文件夹下新增 `verify-commit.js` 文件，写入如下内容，这里对提示内容进行了部分修改，更符合普通开发。需安装 `picocolors` 。执行 `npm i picocolors -D`

```js
import pico from 'picocolors';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const msgPath = path.resolve('.git/COMMIT_EDITMSG');
const msg = readFileSync(msgPath, 'utf-8').trim();

// by https://github.com/vuejs/core/blob/main/scripts/verify-commit.js
const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${pico.white(pico.bgRed(' ERROR '))} ${pico.red(`invalid commit message format.`)}\n\n` +
      pico.red(`  you should submit good message format. Examples:\n\n`) +
      `    ${pico.green(`feat: add a new feature`)}\n` +
      `    ${pico.green(`fix: fixed a logic bug`)}\n\n` +
      pico.red(`or you can install <git-commit-plugin> to complete commit.\n`),
  );
  process.exit(1);
}

/**
-   feat：新增功能。
-   fix：修复 bug。
-   docs：更新文档。
-   dx：改进开发者体验。
-   style：修改样式。
-   refactor：重构代码。
-   perf：性能优化。
-   test：添加或修改测试。
-   workflow：改进工作流程。
-   build：修改构建系统或外部依赖。
-   ci：修改持续集成配置文件或脚本。
-   chore：其他杂项任务。
-   types：修改类型定义文件（如 TypeScript）。
-   wip：进行中的工作，尚未完成。
-   release：发布新版本。
 */
```

### 提交测试

这里先检测格式化代码，然后进行 eslint 和 stylelint 的校验，故意写出一些 eslint 错误或警告，执行 `git commit`

![eslint错误检测](https://jsonq.top/cdn-static/2025/02/25/1740465690406-xbkgqa9z.png)

eslint 执行通过之后开始执行 stylelint 校验

![stylelint错误检测](https://jsonq.top/cdn-static/2025/02/25/1740465690535-chi7nohc.png)

`commit-msg` 校验提交的信息是否符合规范

![错误的提交信息](https://jsonq.top/cdn-static/2025/02/25/1740465690664-mkvhhob6.png)

以上提交信息故意写错，使校验不通过，由此可见 `commit-msg` 生效了，然后改成例子中那样就可以正常提交了

![正确的提交信息](https://jsonq.top/cdn-static/2025/02/25/1740465690783-v8u8b0nq.png)

# git 提交忽略文件

新建 `.gitignore` 文件，将你不想提交到 git 仓库的文件在这里写入即可，支持通配符格式

```bash
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
build
dist-ssr
*.local

# lock 需保留可从此处删除
package-lock.json
yarn.lock
pnpm-lock.yaml

# .vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

stats.html

# cache
.eslintcache
.stylelintcache
```

# 统一编码格式 CRLF 或 LF

lf 是 Unix 编码，crlf 是 windows 编码。

在开发时，绝大部分时候换行符格式都是 `lf`，但是从仓库拉取下来代码后，经常会遇到变成 `crlf` 格式，此时 prettier 就会报错。

![编码问题](https://jsonq.top/cdn-static/2025/02/25/1740465690920-6yg7fka4.png)

为了避免这种现象，可以从两方面杜绝换行符不一致的问题。

**1. 开发时直接将文件编码变成 `lf` 格式**

<b style={{color:"red"}}>需安装 `EditorConfig for VS Code` 插件</b>

在根目录下新建 `.editorconfig` 文件，写入以下内容

```bash
# http://editorconfig.org
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf # 重点是这个，指定行尾结束符为 lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

此时新建一个文件，windows 下默认是 crlf 换行符，当保存时，就会自动转换成 lf 换行符。

**2. 提交时对换行符进行统一，统一为 lf 行尾符**

新建文件 `.gitattributes`，写入以下内容（这也是 v8 的 `.gitattributes` 写法）

```bash
# 自动将所有基于文本的文件的行尾统一为 lf
* text=auto eol=lf

# 不修改二进制文件的行尾，被 git 识别为文本文件修改会造成文件损坏
*.png binary
```

此时提交过后，从仓库拉取一份新的代码下来，就不再是 crlf 而是 lf 行尾符了

![lf编码格式](https://jsonq.top/cdn-static/2025/02/25/1740465691082-r66vxen5.png)

# 配置路径别名

先在 `vite.config.ts` 中添加如下内容，让项目识别该别名

```js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig((mode) => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
});
```

然后让 vscode 识别，需要再向 `tsconfig.json` 或者 `tsconfig.app.json` 中添加对应的别名

```json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

![别名](https://jsonq.top/cdn-static/2025/02/25/1740465691176-pcrkh1qm.png)

# 动态读取 env 环境变量

## env 内容

可以结合 vite 文档进行使用：https://vitejs.dev/guide/env-and-mode.html

这里分为三种 `env` 文件，通用 `.env` 开发环境`.env.development` 生产环境 `.env.production`

以下是三种 env 的例子内容

**.env**

```bash
# 网站标题
VITE_APP_TITLE = "my project"

# port
VITE_PORT = 3000

# open 运行 npm run dev 时自动打开浏览器
VITE_OPEN = false

# 是否删除生产环境 console
VITE_DROP_CONSOLE = true

# 是否生成打包体积分析预览
VITE_REPORT = true

# 是否开启 gzip 压缩
VITE_BUILD_GZIP = false
```

**.env.development**

```bash
# proxy 代理 / axios baseURL
VITE_API_BASE_URL = '/devapi'

# 本地环境接口地址
VITE_API_URL = 'http://localhost:8888/myapi'
```

**.env.production**

```bash
VITE_API_BASE_URL = '/prodapi'

VITE_API_URL = 'http://xxx:1111/api'
```

## vite.config.ts 读取 env

使用 `loadEnv` 读取即可，需要注意的是，读取出来的值都是字符串，所以需要进行一些转换

```js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig((mode) => {
  const env = loadEnv(mode.mode, process.cwd());
  const viteEnv = wrapperEnv(env);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    // proxy 代理
    server: {
      port: viteEnv.VITE_PORT,
      cors: true,
      proxy: {
        [viteEnv.VITE_API_BASE_URL]: {
          target: viteEnv.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/devapi/, ""),
        },
      },
    },
  };
});

/** 对获取的环境变量做类型转换 */
function wrapperEnv(envConf: Record<string, string>) {
  const ret: Record<string, any> = {};
  for (const envName of Object.keys(envConf)) {
    let realName: any = envConf[envName].replace(/\\n/g, "\n");
    realName = realName === "true" ? true : realName === "false" ? false : realName;

    if (envName === "VITE_PORT") realName = Number(realName);

    ret[envName] = realName;
    process.env[envName] = realName;
  }
  return ret;
}
```

## 配置类型提示

env 的环境变量再 ts 和 tsx 等文件中都可以直接访问，除了 `vite.config.ts`

为了有很好的类型提示，可以再 `vite.env.d.ts` 中添加以下类型

```js
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_PORT: number;
  readonly VITE_DROP_CONSOLE: boolean;
  readonly VITE_BUILD_GZIP: boolean;
  readonly VITE_REPORT: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

![image](https://jsonq.top/cdn-static/2025/02/25/1740465691271-87ysuvv4.png)

## index.html 标题使用 env 配置

vite 本身都支持在 html 中读取 env 的环境变量，以下是官方文档的描述

![image](https://jsonq.top/cdn-static/2025/02/25/1740465691384-4nfxxrvp.png)

所以我们也可以直接将网站标题也作为集中配置项

```html
<title>%VITE_APP_TITLE%</title>
```

# 打包相关内容

## 手动分包

```js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig((mode) => {
  return {
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          // Static resource classification and packaging
          chunkFileNames: 'js/chunk-[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]', // 可自定义生成的文件夹名，可接收函数的返回值
        },
      },
    },
  };
});
```

## gzip 压缩，去除 console，代码体积分析

```bash
npm i rollup-plugin-visualizer vite-plugin-compression2 terser -D
```

- rollup-plugin-visualizer 用于在打包完成后是否生成体积预览页面
- vite-plugin-compression2 基于 vite-plugin-compression 升级的压缩插件
- terser 打包时自动去除 console

配置如下

```js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig((mode) => {
  return {
    plugins: [
      react(),
      viteEnv.VITE_REPORT && visualizer(), // 体积分析
      viteEnv.VITE_BUILD_GZIP && compression({ threshold: 1025 }), // 大于 1kb 压缩
    ],
    esbuild: {
      pure: viteEnv.VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
    },
    build: {
      outDir: 'dist',
      // esbuild 打包更快，但是不能去除 console.log，去除 console 使用 terser 模式 npm i terser -D
      // minify: "esbuild",
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: viteEnv.VITE_DROP_CONSOLE,
          drop_debugger: true,
        },
      },
    },
  };
});
```

## vite.config.ts 完整配置

```js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { compression } from "vite-plugin-compression2";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig((mode) => {
  const env = loadEnv(mode.mode, process.cwd());
  const viteEnv = wrapperEnv(env);

  return {
    plugins: [
      react(),
      viteEnv.VITE_REPORT && visualizer(),
      viteEnv.VITE_BUILD_GZIP && compression({ threshold: 1025 }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    server: {
      port: viteEnv.VITE_PORT,
      cors: true,
      proxy: {
        [viteEnv.VITE_API_BASE_URL]: {
          target: viteEnv.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },

    esbuild: {
      pure: viteEnv.VITE_DROP_CONSOLE ? ["console.log", "debugger"] : [],
    },
    build: {
      outDir: "dist",
      // esbuild 打包更快，但是不能去除 console.log，去除 console 使用 terser 模式 npm i terser -D
      // minify: "esbuild",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: viteEnv.VITE_DROP_CONSOLE,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // Static resource classification and packaging
          chunkFileNames: "js/chunk-[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: "[ext]/[name]-[hash].[ext]", // 可自定义生成的文件夹名，可接收函数的返回值
        },
      },
    },
  };
});

/** 对获取的环境变量做类型转换 */
function wrapperEnv(envConf: Record<string, string>) {
  const ret: Record<string, any> = {};
  for (const envName of Object.keys(envConf)) {
    let realName: any = envConf[envName].replace(/\\n/g, "\n");
    realName = realName === "true" ? true : realName === "false" ? false : realName;

    if (envName === "VITE_PORT") realName = Number(realName);

    ret[envName] = realName;
    process.env[envName] = realName;
  }
  return ret;
}
```

# 总结

本文章主要内容如下

- eslint 配置，校验代码的错误及不合规处
- prettier 集成，统一代码风格
- prettier 结合 eslint 配置，给出 代码不规范的提示
- stylelint 集成，规范 css 书写，包含校验 排序
- less 集成
- postcss 集成，自动添加浏览器前缀
- env 文件自动区分读取
- 打包优化，压缩、去除 console、手动分包
- .vscode 文件配置，单项目统一 vscode 配置
- 项目路径别名
- pretty-quick 和 simple-git-hooks 对代码提交时进行一系列校验，包括提交前的代码格式化、eslint 校验、stylelint 校验、提交信息校验
- editorconfig 和 .gitattributes 统一开发和提交时的文件行尾符格式，避免产生代码库和本地代码格式不同的问题

其中需要安装的 vscode 插件有

- Prettier
- ESlint
- Stylelint
- Editorconfig for Vscode

最后附上该项目的结构，其中 `tailwindcss` 的配置可忽略，其余文章中都有涉及。

![项目目录](https://jsonq.top/cdn-static/2025/02/25/1740465691537-8mt7sxe1.png)
