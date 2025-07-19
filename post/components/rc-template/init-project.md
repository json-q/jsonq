---
title: 从零到一构建并打包 React + TypeScript + Less组件库系列（一、项目初始化搭建+代码规范集成）
date: 2024-11-14 11:38
---

本系列涉及的内容如下：

1. 组件库基础搭建，react + ts + less
2. 项目规范，包括但不限于 prettier、eslint、stylelint、husky、lint-staged、commitlint
3. pnpm monorepo + turborepo 集成
4. gulp + webpack 构建 esm、cjs 和 umd
5. icon 组件库自动生成 Icon 组件脚本
6. storybook 文档集成

此系列暂不包含发布 npm 和构建 CI 流程（这部分也相对简单，`github action` 实现文档部署，`changesets` 发包）。

<span style={{color:"blue"}}>此系列不是所谓的最佳实践，流行组件库经过迭代都非常完善，不是一人力能完成的，而本系列只是将核心进行了整理</span>

> 阅读本系列需要对组件库的构成有一定的了解，不多，一点点即可，纯小白可能会有点难入手。

[点击查看本章节 commit](https://github.com/json-q/rc-library-templete/commit/edaa1adb6772babf475612a754566f0dbefa52fb)

## 初始化项目

```bash
mkdir react-library-templete
cd react-library-templete
pnpm init
```

### package.json 初始化工作

由于是 pnpm monorepo 项目，必须使用 pnpm，可以在 `package.json` 中做一下限制

```json
  "scripts": {
    "preinstall": "npx only-allow pnpm",
  },
  "packageManager": "pnpm@9.12.3",
  "engines": {
    "node": ">=20"
  },
```

- `packageManager` 可以不写，主要作用是为了约束开发都是用这个版本，避免包管理工具版本不一致导致的兼容问题
- `engines` 指定项目使用的 node 版本

**注意：** 一旦声明 `packageManager`，在执行 `install` 时，会提示你是否替换成指定版本，此替换为全局的版本替换，之前的安装版本将被覆盖

### 安装基础依赖

使用 TypeScript + Less 编写，肯定要安装 typescript 和 less，如果涉及到 node 相关的，还可以再安装一个 @types/node 类型提示

```bash
pnpm i typescript less @types/node -D
```

## 项目规范

### 集成 eslint

需提前安装 `ESLint` 插件

```bash
pnpm dlx @eslint/create-config
```

![image](https://jsonq.top/cdn-static/2025/02/25/1740465674009-r6fksi55.png)

eslint 基本结构有了，再装一些辅助插件

```bash
pnpm i eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-react-refresh -D
```

- `eslint-plugin-jsx-a11y` 是一个无障碍访问的 eslint 检测，可按需安装
- `eslint-plugin-react-refresh` 检测 react 组件是否可以安全刷新，可按需安装

在 `eslint.config.mjs` 中添加这几个插件

```js
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    ignores: [
      '**/dist/*',
      '**/es/*',
      '**/lib/*',
      'node_modules',
      '*.woff',
      '.ttf',
      '.vscode',
      '.idea',
      '.husky',
      '.local',
      '/bin',
      '.eslintcache',
      '.stylelintcache',
    ],
  },
];
```

> `eslint` 配置过程中，可以新建一个 ts 文件，写一些不规范代码，时刻查看 eslint 的检测是否会失效，因为由于写法错误也会导致 eslint 的配置失效。

### 集成 Prettier

需提前安装 `Prettier` 插件

```bash
pnpm i prettier eslint-plugin-prettier eslint-config-prettier -D
```

新建 `.prettierrc.cjs`

```js
/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 120,
  useTabs: false,
  singleQuote: true,
  proseWrap: 'never',
};
```

新建 `.prettierignore`

```txt
**/dist/*
**/es/*
**/lib/*

**/.local
**/node_modules/**

**/*.svg
**/*.sh

.eslintcache
.stylelintcache
```

此时你可以发现 `.prettierrc.cjs` 被 eslint 报错了

![image](https://jsonq.top/cdn-static/2025/02/25/1740465674140-clkgisgs.png)

这是由于 module 是 node 环境的全局变量，而 eslint 不识别 node 环境。在 `eslint.config.mjs` 中的 `globals` 属性添加 node 全局变量

```js
export default [
  // ...
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  // ...
];
```

此时就没问题了

#### prettier 和 eslint 的集成

前边写过的都省略掉了，只列出更改的部分。该部分让 eslint 和 prettier 做了集成，并添加了一项 eslint 关闭校验的规则 `@typescript-eslint/no-explicit-any`，即此时是允许使用 `any` 的（默认禁止使用 any）

```js
// ...
import eslintConfigPrettier from 'eslint-config-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ...
  eslintConfigPrettier,
  prettierRecommended,
  {
    // ...
    rules: {
      // ...
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
```

不出意外的话，此时就能看到 `eslint.config.mjs` 中存在大量的 prettier 报错提示。

![image](https://jsonq.top/cdn-static/2025/02/25/1740465674250-2ykr44hu.png)

在根目录新建一个 `.vscode` 文件夹，在文件夹内部新建 `settings.json` 文件

```json
{
  "search.exclude": {
    "**/node_modules": true,
    "dist": true,
    "es": true,
    "lib": true,
    "storybook-static": true,
    "pnpm-lock.yaml": true
  },
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "stylelint.validate": ["css", "less", "scss", "sass", "html"]
}
```

其实主要就是自动保存格式化，然后回到 eslint 的文件，保存就会自动格式化，如果格式化后依然报错，可以尝试重启 vscode。

#### 编码问题

在 windows 上默认是 CRLF 编码，而 prettier 认为这是一种错误的编码方式，格式化也不行。

![image](https://jsonq.top/cdn-static/2025/02/25/1740465674347-4bgbnqhm.png)

- 安装 `EditorConfig for VS Code` 插件
- 根目录新建 `.editorconfig`，写入内容，再次保存，就可以看到编码已经变成 `LF` 了

```txt
# http://editorconfig.org
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

##### 使用 .gitattributes 解决多环境编码不一致问题

editconfig 只是解决本地开发的编码问题，当你提交到 git 后，再拉取一个全新的，如果是 win 系统，依然是 CRLF。

为了解决这个问题，可以在代码提交时做格式上的统一，在根目录新建 `.gitattributes`，统一编码为 `LF`，且文件类的不做处理

```txt
* text=auto eol=lf

*.{ico,png,jpg,jpeg,gif,webp,svg,woff,woff2} binary
```

### Stylelint 集成

由于使用 less 开发，所以就额外安装了 less 的解析和校验插件

```bash
pnpm i stylelint stylelint-config-recommended stylelint-config-standard-less stylelint-prettier stylelint-order stylelint-config-recess-order postcss-less -D
```

这几个我就不过多介绍了，其中 `stylelint-order` 和 `stylelint-config-recess-order` 就是 css 排序插件和排序规则，两个结合使用（可选安装）。

根目录新建文件 `.stylelintrc.cjs`

```js
/** @type {import("stylelint").Config} */
module.exports = {
  plugins: ['stylelint-order'],
  customSyntax: 'postcss-less',
  extends: [
    'stylelint-config-recommended',
    'stylelint-prettier/recommended',
    'stylelint-config-recess-order',
    'stylelint-config-standard-less',
  ],
  rules: {
    // 规则自定义即可
    'color-function-notation': null,
    'less/no-duplicate-variables': null,
  },
  ignoreFiles: [
    '**/.js',
    '/*.jsx',
    '/.tsx',
    '**/.ts',
    '**/dist/**',
    '**/es/**',
    '**/lib/**',
    '**/node_modules/**',
  ],
};
```

完毕之后可以随便建一个测试的 less 文件，写一些内容来测试插件是否生效

![image](https://jsonq.top/cdn-static/2025/02/25/1740465674465-hqg9y6po.png)

由此可见，排序插件是生效了，此时保存代码就可以自动修复排序规则，那这个 stylelint 的配置应该也没什么问题。

> 如果没有生效，尝试重启 vscode，且每次更改 stylelint 的配置后，都建议重启验证

#### scripts 添加 fix 命令（可忽略）

`package.json` 添加 `script` 命令

```json
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "lint:eslint": "eslint . --fix --cache",
    "lint:stylelint": "stylelint \"**/*.{less,css}\" --fix --cache"
  },
```

## monorepo 基本结构搭建

这里不介绍 monorepo 单体仓库的作用，能看到该文章的应该都对其有一定的了解。

该项目的多包仓库思路是：

- `packages` 文件夹作为组件开发的核心模块
  - 多个子包都需要 tsconfig 的配置，那就可以把这个配置抽离出来
  - icon 组件库作为一个单独的包
  - 其它广泛使用的组件为组件库核心包（常用 util hook 什么的也可以抽离，这里不再做更细致划分）
- `storybook` 文档作为单独的模块
- `site` 组件库网站作为单独模块（可选）

此时结构目录应该是

```txt
- packages
    - components
    - icons
    - tsconfig
- site
- storybook
```

目录新建完毕后，根目录新建 `pnpm-workspace.yaml`

```yml
packages:
  - packages/*
  - site
  - storybook
```

此时 monorepo 的基本目录结构就已经搭建好了

### 初始化 packages 目录的子包

其中 `site` 和 `storybook` 先设为 TODO（待办），优先整理 `packages` 下的子包

`packages` 下的包统一初始化执行 `pnpm init` 命令

#### tsconfig

进入 tsconfig 目录，将 `package.json` 中的 `name` 修改为你喜欢的包名，后续都是以 `name` 字段的名字安装依赖，由于项目内使用，设置成 private 即可，我设置的 `rclt` 就是 `react-component-library-templete` 的简写。

```json
{
  "name": "rclt-tsconfig",
  "version": "0.0.1",
  "description": "",
  "keywords": [],
  "author": ""
}
```

**json 内容仅供参考**

新建 `base.json` 文件

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "composite": false,
    "declaration": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "allowImportingTsExtensions": true,
    "allowJs": true,
    "inlineSources": false,
    "isolatedModules": true,
    "module": "ES2020",
    "moduleResolution": "Bundler",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strictNullChecks": true
  },
  "exclude": ["dist", "build", "es", "lib", "node_modules"]
}
```

新建 `react-library.json` 文件

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "ES6",
    "target": "ES5",
    "jsx": "react",
    "lib": ["DOM", "ES2016"]
  }
}
```

此时就可以在根目录添加 `rclt-tsconfig` 依赖

```json
  "devDependencies": {
    "rclt-tsconfig": "workspace:*",
  }
```

执行 pnpm i 安装，新建一个 `tsconfig.json` 来使用这个包

```json
{
  "extends": "rclt-tsconfig/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["packages/**/*.tsx", "packages/**/*.ts"]
}
```

> 不要问我为什么不使用命令安装，问就是没找到根目录安装子包的命令（不会）

#### components

将 `rclt-tsconfig` 链接到 `components` 包下，以下命令的意思就是从本地找 `rclt-tsconfig` 安装到 `rclt-components` 下

- `rclt-components` 是 components 包 `package.json` 中的 `name`。
- `-workspace` 是从本地查找
- 暴力一点的话直接在 `package.json` 中写入包依赖，比如 `"rclt-tsconfig": "workspace:*"`，再执行 pnpm install 即可。

```bash
pnpm --filter rclt-components add rclt-tsconfig -D -workspace
```

新建 `tsconfig.json`

```json
{
  "extends": "rclt-tsconfig/react-library.json",
  "compilerOptions": { "emitDeclarationOnly": true }, // 只生成声明文件
  "include": ["src"]
}
```

没问题的话，点 `extends` 的路径链接是可以跳到 json 文件的

## 提交规范

这些依赖的集成都是在根目录进行的，记得安装的时候带上 `-w` 来指定在根工作区安装。

### husky + lint-staged 集成

#### 安装依赖之前的准备工作

在此之前，先把我们的项目 git 初始化一下，执行 `git init` 命令，最好再建一个 git 仓库，关联本地代码，这部分我就不赘述了，大家应该都会。

根目录新建 `.gitignore`，以下是我的文件内容，大家可自行修改忽略文件（我个人习惯不上传 lock 依赖，除非特殊情况需要锁定版本）

```txt
# Dependencies
node_modules
.pnp
.pnp.js

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
coverage

# Turbo
.turbo

# Vercel
.vercel

# Build Outputs
.next/
out/
build
dist
es
lib


# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.DS_Store
*.pem

# cache
.eslintcache
.stylelintcache

# lock
pnpm-lock.yaml
```

#### 集成依赖

安装并初始化 husky

```bash
pnpm i husky lint-staged -D -w
# 初始化 husky
npx husky init
```

执行完毕 script 中会添加一个 husky 命令，根目录会生成 `.husky` 文件，其中有一个 `pre-commit` 脚本文件，写入以下内容

```bash
npx lint-staged
```

这件事就是在代码 commit 之前，执行 `lint-staged` 做一些事情，比如检测代码规范，格式化代码等，接下来就干这个事。

根目录新建 `.lintstagedrc`

```json
{
  "packages/**/*.{js,jsx,ts,tsx}": ["eslint --fix --cache", "prettier --write"],
  "packages/**/package.json": ["prettier --write"],
  "packages/**/*.{css,less}": ["stylelint --fix --cache", "prettier --write"],
  "**/*.md": ["prettier --write"]
}
```

内容应该都能看得懂，就是匹配到的文件执行相应的命令

### commitlint 集成

```bash
pnpm i @commitlint/cli @commitlint/config-conventional -D -w
```

根目录新建 `commitlint.config.js`

```js
module.exports = {
  ignores: [(commit) => commit.includes('init')],
  extends: ['@commitlint/config-conventional'],
};
```

`.husky` 文件夹下新建 `commit-msg`

```bash
npx --no-install commitlint --edit $1
```

#### 测试集成是否正常工作

我们把 lint-staged 和 commitlint 准备工作都完成了，如何测试呢？

首先测试 `lint-staged`，即写一段被 eslint 警告的代码进行提交：

```js
// pakcgaes/components/src/index.ts

const a = 1; // 'a' is assigned a value but never used.
```

然后执行 commit（初次执行代码校验时间可能较长）

![image](https://jsonq.top/cdn-static/2025/02/25/1740465674568-merp240h.png)

上图可以看到，lint 校验没通过，无法 commit，此时再把 `const a = 1;` 删除掉，消除 eslint 的报错，再次执行 commit

![image](https://jsonq.top/cdn-static/2025/02/25/1740465674709-qnpa4a7t.png)

上图可知，这次代码的校验已经通过，但是 commitlint 抛出了错误，提示 commit 信息不规范，此时修改一下再提交

![image](https://jsonq.top/cdn-static/2025/02/25/1740465674833-qpi6bask.png)

此时提交就可以正常通过了，接下来推送到远程仓库即可。
