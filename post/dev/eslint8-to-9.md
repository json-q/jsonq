---
title: ESlint 8 升级至 9
date: 2024-08-13
---

eslint 8 到 9 属于破坏性更新（Break Change），因此导致 eslint 8 配置方式无法直接使用（可以使用兼容包，但这不是本文的主题）。

其实大家最关心的就是从 eslint 8 到 9 之后的写法，而与 `eslint` 息息相关的多种配置插件也需要大量的变更，因此本文核心就是：使用 `eslint9` 配置规则和集成 `prettier`。废话不多说，开始。

## 环境要求

不支持 Node 19 所有版本，Node 18 最低要求 `18.8.0`，Node 20 最低要求 `20.9.0` 及 Node 21.1.0 以上。

![image](https://jsonq.top/cdn-static/2025/02/25/1740465682578-45remhzb.png)

## 升级 eslint 至最新版

`9.9.0` 是我写文章时的最新版本

```bash
npm i eslint@^9.9.0 -D
```

## 安装 @eslint/js

```bash
npm i @eslint/js -D
```

## 安装 typescript-eslint

```bash
npm i typescript-eslint -D
```

该文件包含了 `@typescript-eslint/parser` 和 `@typescript-eslint/eslint-plugin`，因此需**移除以上两个依赖**，而且以上两个插件不直接支持 eslint9

## 安装 globals

```bash
npm i globals -D
```

该包在 eslint 的配置中会用到

## 旧 eslint 配置文件改名为 eslint.config.js

![image](https://jsonq.top/cdn-static/2025/02/25/1740465682741-dcgggutn.png)

在 8 版本及之前，eslint8 及之前默认读取的以上配置文件中，**以上约定式文件已在 eslint9 中移除，可使用兼容包，但是兼容模式在 10 会移除**

## 新 eslint.config.js 写法示例

需提前安装 `prettier` `eslint-plugin-prettier` `eslint-config-prettier` 由于项目是 react，所以有 react 相关的规则插件，但都注释掉了，可以参考写法进行配置。新的 `eslint.config.js` 内容如下

```js
import js from '@eslint/js';
import globals from 'globals';
// import reactHooks from "eslint-plugin-react-hooks";
// import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config({
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
  ],
  files: ['**/*.{ts,tsx}'], // eslint 检测的文件，根据需要自行设置
  ignores: ['dist'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    // "react-hooks": reactHooks,
    // "react-refresh": reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,

    'prettier/prettier': 'warn', // 默认为 error
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',

    '@typescript-eslint/no-explicit-any': 'off', // allow any type
  },
});
```

`eslint-plugin-react-hooks` 和 `eslint-plugin-react-refresh` 为 react 相关规则插件，可根据项目框架自行设置 plugins。

## 验证 eslint 和 prettier 的正确运作

最好重启一下 vscode。

![image](https://jsonq.top/cdn-static/2025/02/25/1740465682832-tlgg3079.png)

## 移除 .eslintignore 文件

eslint9 不再支持 `.eslintignore`，如要使用，需配置在 `eslint.config.js` 中的 `ignore` 属性里

## eslint 规则校验

8 -> 9 的规则有部分新增，且部分规则更为严格。为了检查当前项目的 TS 类型是否符合规范，可以运行如下命令

```bash
npx eslint .
```

## eslint-plugin-react-hooks 不兼容 eslint9 处理

`eslint-plugin-react-hooks` 4.x 版本不兼容 eslint9，需安装 rc 版本

```bash
npm i eslint-plugin-react-hooks@^5.1.0-rc.0 -D
```
