---
title: html 搭建 vue 项目
date: 2024-06-22
---

# 前言

奇怪的知识又增加了 `(⊙_⊙)`。

使用原生 html 写 vue 项目。**注意：是项目，而不是页面**，此方式是不推荐的，毕竟有脚手架，但在一些及其特殊场景下，可能会需要类似的方式，因此作为一个记录。

> 这种方式唯一的优点就是写完可以直接扔服务器上了－\_－

# 对 html 写 vue 的认知

很多人对 在 html 中运行 vue 项目这种内容，认知只停留在引入 vue 的 cdn 文件，然后在 html 里一顿写，就觉得 <span style="color:blue;">html 写 vue 不是很简单嘛</span>，但请注意用词，是**项目**，而不是**页面**，你能写一个 `.vue` 页面引入让 html 去运行吗？显然不可以，而此文章就是说这个的。

---

正常想要在原生 html 中直接写 `.vue` 文件是不现实的，因为 html 压根就不认识 .vue 文件，只有脚手架才能识别，那如何才能让 html 识别 `.vue` 文件呢？其实也很简单，核心就是一个包 `vue3-sfc-loader`

# vue3-sfc-loader 使用场景

因为 `vue3-sfc-loader` 可以直接解析 `.vue` 文件，所以可以使用在页面中远程加载 vue 组件的场景中

# 如何获取 vue 等 npm 的离线包

- [jsdelivr](https://www.jsdelivr.com/) <strong style="color:red;">推荐</strong>
  - 优点：更新及时，所有 npm 包都可查询到
  - 缺点：自行区分 es 和 umd 包，且部分包依赖文件需自行查找
- [cdnjs](https://cdnjs.com/)
  - 优点：有明确的 es 和 umd 包，项目相关包罗列较为完整，如果 jsdelivr 上无法找到 es 和 umd 包的可以使用此网站
  - 缺点：更新并不是最快，很多 npm 包缺失，比如此次的 `vue3-sfc-loader` 在 cdnjs 上无法搜索到
- [unpkg](https://unpkg.com/)
  - 优点：与以上两个相比，暂无
  - 缺点：需要知道想要下载的文件名，包括区分 es 和 umd

## 什么是 es 包和 umd 包

es 包支持 import 导入的写法，比如这样

```html
<script type="module">
  import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
</script>
```

而 umd 包是直接运行在浏览器的，比如我引入了 `vue.global.js` 这就是一个 browser 包，我可以在 window 上访问到 `Vue` 实例

使用时就是这样

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  const { createApp, ref } = Vue; // window.Vue
</script>
```

> es 包是需要 `script` 标签添加 `type="module"`，导入方式为`import`。而 umd 包引入之后，会自动挂载到 window 上，导入方式为解构 `const {...} = Vue`

# 让 html 识别 `.vue` 文件

<strong style="color:red;">需由一个前提条件，由于下载的都是生产文件，打开 html 页面时需要使用 `Live Server` 插件打开，普通打开方式无法运行</strong>

> 这里统一用 es 文件，模仿脚手架结构进行搭建

1. 下载 `vue` 离线 es 文件： [vue.esm-browser.prod.min.js](https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.29/vue.esm-browser.prod.min.js)
2. 下载 `vue3-sfc-loader` 离线 es 文件：[vue3-sfc-loader.esm.js](https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.9.5/dist/vue3-sfc-loader.esm.js)
3. 新建 `index.html`，并引入下载好的 vue 和 sfc 解析文件

这种 `Import maps` 写法在 vue 官网上有 [示例](https://cn.vuejs.org/guide/quick-start.html#enabling-import-maps)

**特性：** 其实就是一个路径映射，此时 `import {} from "vue"` 等价于 `import {} from "./lib/es/vue.esm-browser.prod.min.js"` **优点：**

- 可以非脚手架项目中可以支持 `import {} from "vue"`。
- 如果不使用，就需要 `import {} from "./lib/es/vue.esm-browser.prod.min.js"` 引入相对或绝对路径，冗余且意义不大

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <!-- vue 的挂载节点 -->
    <div id="app"></div>
  </body>
  <script type="importmap">
    {
      "imports": {
        "vue": "./lib/es/vue.esm-browser.prod.min.js",
        "vue3-sfc-loader": "./lib/es/vue3-sfc-loader.esm.js"
      }
    }
  </script>
  <script type="module" src="./main.js"></script>
</html>
```

4. 新建 `main.js` 文件，写入 sfc 解析 vue 文件的规则，并挂载 vue 实例，由于 html 的 script 标签上写了 `type="module"`，所以可以在 `main.js` 中使用 `import` 语法

```js
import { loadModule } from 'vue3-sfc-loader';
import * as Vue from 'vue';
const { defineAsyncComponent, createApp } = Vue;

const options = {
  moduleCache: {
    vue: Vue,
  },
  async getFile(url) {
    const res = await fetch(url);
    if (!res.ok) return;
    return {
      getContentData: (asBinary) => (asBinary ? res.arrayBuffer() : res.text()),
    };
  },
  addStyle(textContent) {
    const style = Object.assign(document.createElement('style'), {
      textContent,
    });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
};

// 引入 App.vue 根文件
const loadComponent = defineAsyncComponent(() => loadModule('./pages/App.vue', options));

// 挂载 vue
createApp(loadComponent).mount('#app');
```

`addStyle` 是为了解析 `.vue` 文件中的 `style` 样式插入到 header 中。

5. 新建 `App.vue` 文件，写入测试内容，然后使用 `Live Server` 打开 html 文件

```html
<script setup>
  import { ref } from 'vue';
  const count = ref(0);
</script>

<template>
  <h1>123</h1>
  <div class="title">count: {{ count }}</div>
  <button @click="count++">+1</button>
</template>

<style scoped>
  .title {
    color: red;
  }
</style>
```

效果如图所示

![image](https://jsonq.top/cdn-static/2025/02/25/1740465694414-rzbqadcg.png)

# 使用第三方组件库

这个需要对组件库有一定的熟悉程度，了解其构成结构，而且需要官方对 es 格式的组件库文件有相当完善的支持。目前测试下来，只有 `antd vue` 对此方式的支持度最完善，可以在 cdnjs 中搜索下载。 `element plus` `arco vue` 这些组件库对 es 的支持度并不是特别好，如果想要使用，只能退而求其次，使用 umd 格式，这种方式就不能 import 导入，而是从 window 上获取使用。

1. 下载 `antd vue` 相关的 min.js 和 css 并在 `index.html` 使用 map 映射（官网上还明确标注依赖了 dayjs 的 plugin 插件）

```html
<link rel="stylesheet" href="./lib/es/antd.reset.min.css" />

<script type="importmap">
  {
    "imports": {
      // ...
      "antd": "./lib/es/antd.esm.min.js"
    }
  }
</script>
```

2. 和 `main.js` 中注册组件库

```js
import * as antd from 'antd';

const options = {
  moduleCache: {
    vue: Vue,
    antd: antd, // 组件库等第三方包不在 use 注册，在此处注册，否则 sfc 会将 antd 识别为项目内部的 vue 组件，找不到而报错
  },
  // ...
};
```

3. 使用组件库

```html
<script setup>
  import { ref } from 'vue';
  import { Button } from 'antd';

  const count = ref(0);
</script>

<template>
  <span class="title">count: {{ count }}</span>
  <button @click="count++">+1</button>
</template>
```

![image](https://jsonq.top/cdn-static/2025/02/25/1740465694488-8k2kn1ge.png)

至此，离线方式搭建 vue 项目就此完成。

> 其实这种方式的缺点还是蛮多的，如果想用的组件库 es 支持度不够或有问题，只能选择 umd 格式使用
