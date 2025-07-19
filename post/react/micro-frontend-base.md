---
title: 乾坤框架基本使用
date: 2024-05-24
---

微前端用通俗易懂的话来说就是：一个主应用（基座）中可以搭建多个子应用（微应用），这些子应用可以是不同版本，不同前端框架，而且跟主应用的语言无关，主应用仅仅是一个基座。

正常一个项目想要展示另一个项目，通常会用 iframe 进行嵌入，但是相比 iframe，`qiankun` 等微前端的接入表现形式会更加友好，如果要以 iframe 为基础的，可以尝试使用腾讯的 `无界` 框架。

## 创建项目

本文主要以 react + webpack 的接入为主，因为 `qiankun` 对于 vite 的支持度并不友好，vue3 同样首推 vite，虽然有社区插件 `vite-plugin-qiankun` 可以接入，但是出现的问题也是很多的，作为项目来开发并不是首选。

以 CRA 脚手架创建三个项目，一个主应用基座 `app`，两个微应用 `micro-app-1` `micro-app-2`，也可以自己使用 webpack 搭建

```bash
npx create-react-app app --template typescript
```

其目录结构如下

```text
—— app
—— micro-app-1
—— micro-app-2
```

`qiankun` 的接入是需要修改 webpack 的，而 CRA 隐藏了 webpack 配置，可以使用 `eject` 暴露出所有的配置，也可以采用插件复写 webpack 配置，这里采用 `craco` 进行复写 webpack 配置。

安装 `craco`（每个项目都要装，都要配置 webpack）

```bash
npm i @craco/craco -D
```

package.json 修改 script 命令

```json
{
  // ...
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test"
  }
}
```

项目根目录新建 `craco.config.js`，这里只修改项目的启动端口，和关闭允许项目自动打开浏览器，3 个项目是不同的启动端口，关于 qiankun 的配置在下一小节

```js
// craco.config.js
module.exports = {
  devServer: {
    port: 3000,
    open: false,
  },
};
```

## 接入 qiankun

这一部分可以结合 [qiankun 官网](https://qiankun.umijs.org/zh/guide/tutorial) 进行阅读.

### 主应用注册微应用

在主应用 `app` 的入口文件 `index.tsx` 中，添加如下内容

```js
// index.tsx
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'qiankun-app1', // 给该应用起个名字
    entry: '//localhost:1111', // micro-app-1 项目的运行地址
    container: '#app1', // micro-app-1 应用挂载的 dom 节点
    activeRule: '/micro-app1', // 在主应用访问 /micro-app1 加载子应用
  },
  {
    name: 'qiankun-app2',
    entry: '//localhost:2222',
    container: '#app2',
    activeRule: '/micro-app2',
  },
]);

// start 内部的 experimentalStyleIsolation 是样式隔离，不需要可直接写 start()
start({ sandbox: { experimentalStyleIsolation: true } });
```

以上代码是注册了微应用，比如第一个，当访问 `micro-app1` 路由时，挂载子应用到 `#app1` 这个 dom 节点上（需提供挂载容器），子应用的运行地址是 `localhost:1111`

所以需要在主应用中提供子应用的挂载容器，

```ts
function App() {
  return (
    <>
      <h2>app</h2>
      <Link to="/micro-app1"> to App1 </Link>
      <Link to="/micro-app2"> to App2 </Link>

      <div id="app1"></div>
      <div id="app2"></div>
    </>
  );
}
```

这里安装了 `react-router-dom`

### 微应用对接主应用

上述步骤，主应用的配置基本完毕，现在需要配置子应用。

1. 在 src 目录下新增 `public-path.js`，写入内容，**并在 `index.tsx` 中引入**

```js
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

这段代码是为了在访问子应用的静态资源时，可以加载子应用的静态资源

![image](https://jsonq.top/cdn-static/2025/02/25/1740465691680-4573lov0.png)

如图所示，子应用的静态资源直接加载的就是完整路径地址

2. 在子应用中写入 `qiankun` 需要的生命周期，这里以 `micro-app-1` 为例，另一个也一样，完整代码如下

**`public-path.js`** 的引入，一定要在 `App.tsx` 引入之前

```js
import "./public-path";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const isQiankun = !!window.__POWERED_BY_QIANKUN__;

console.log(isQiankun);

let root: ReactDOM.Root;

function render(props: Record<string, any> = {}) {
  const { container } = props;
  root = ReactDOM.createRoot(
    container ? container.querySelector("#root") : document.querySelector("#root")
  );
  root.render(
    <BrowserRouter basename={container ? "/micro-app1" : "/"}>
      <App />
    </BrowserRouter>
  );
}

// 独立运行，直接调用 createRoot函数 render
if (!isQiankun) {
  render();
}

export async function bootstrap() {
  // console.log("app1 bootstraped 加载");
}

export async function mount(props: Record<string, any>) {
  // console.log("app1 mount 加载，主应用 prop: ", props);
  render(props);
}

// lifecycle => 卸载
export async function unmount(_props: any) {
  // console.log("app1 unmount 卸载", _props);
  root.unmount();
}
```

这里 `window.__POWERED_BY_QIANKUN__` 会报 TS 错误，可以直接在 `react-app-env.d.ts` 中写入

```ts
interface Window {
  __POWERED_BY_QIANKUN__: any;
  __INJECTED_PUBLIC_PATH_BY_QIANKUN__: any;
}
```

3. 写入 webpack 配置

在 `craco.config.js` 中写入以下内容，此处可结合官方文档查看，其中官方文档中的 `watchContentBase` 已被移除，不写。

```js
const path = require('path');
const { name } = require('./package.json');

module.exports = {
  webpack: {
    configure: (config) => {
      config.output.library = { name: `${name}-[name]`, type: 'umd' };
      config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
      config.output.globalObject = 'window';
      return config;
    },
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  devServer: {
    port: 1111,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    historyApiFallback: true,
    hot: true,
    liveReload: false,
  },
};
```

修改 webpack 配置后重启项目，此时访问 `http://localhost:3000/micro-app1` ，以主应用的地址+子应用路由，就可以看到该子应用，另一个子应用配置同理

## 主应用微应用路由注册

![image](https://jsonq.top/cdn-static/2025/02/25/1740465691797-a74iwugr.png)

当匹配到主应用路由时，只会渲染主应用的路由，当主应用切换到子应用路由时，才会挂载子应用路由，简单示例图如下

![image](https://jsonq.top/cdn-static/2025/02/25/1740465691933-3p6981dd.gif)

其中 ` <Route path="*" element={<></>} />` 是为了控制台不报警告加上的，不然主应用在切换到子应用时，其自身匹配不到这个路由，就会一直报警告，例如

![image](https://jsonq.top/cdn-static/2025/02/25/1740465692315-qqolwhc3.png)

`/micro-app1` 并不在主应用路由之内，匹配的是微应用项目，就会报警告

美化版的主子应用路由切换

![image](https://jsonq.top/cdn-static/2025/02/25/1740465692468-2ckz17gv.gif)

## Vue3 Webpack 子应用对接 qiankun

这部分属于追加内容，同样以 webpack 为主，可以使用 vue-cli，也可以自行搭建。

1. 在 src 目录下新增 `public-path.js`，写入内容，**并在 `main.js` 中引入**

```js
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

2. 在 `main.js` 中写入 `qiankun` 需要的生命周期

```js
// main.js
import './public-path';
import { createApp } from 'vue';
import App from './App.vue';
import routes from './routes';
import { createRouter, createWebHistory } from 'vue-router';

const isQiankun = !!window.__POWERED_BY_QIANKUN__;
console.log(isQiankun);

const router = createRouter({
  history: createWebHistory(isQiankun ? '/vue-app' : '/'),
  routes,
});

// 这里不能直接写 const app = createApp(App); 因为每次切换到 vue应用都会执行，会造成重复挂载，控制台有警告
let app;

/** render 函数动态挂载 vue 应用 */
function render(props = {}) {
  app = createApp(App);
  const { container } = props;
  app.use(router).mount(container ? container.querySelector('#app') : '#app');
}

// 独立运行
if (!isQiankun) {
  render();
}

export async function bootstrap() {}

export async function mount(props) {
  render(props);
}

export async function unmount() {
  app.unmount();
}
```

3. 写入 webpack 配置，如果是 `vue.config.js`，则写入以下内容，如果是自行搭建的，则和文章上方，配置 react 的 webpack 一样

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service');
const { name } = require('./package');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3333,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${name}`,
    },
  },
});
```

**此时需要在主应用中注册 vue 子应用和添加 vue 子应用的挂在容器**

## qiankun 应用部署

### 前端部署准备

跟正常项目部署基本一致，值得注意的是：主应用访问子应用时，需要配置 nginx 的代理访问。部署前准备，主应用注册的子应用地址需要更换为线上地址（可以在 env 中配置，避免频繁更改）

如下所示环境变量配置

```bash
# .env.development

REACT_APP_RC1_IP = "//localhost:1111"
REACT_APP_RC2_IP = "//localhost:2222"

# .env.production

REACT_APP_RC1_IP = "//xxx:8848"
REACT_APP_RC2_IP = "//xxx:8849"
```

注册应用的入口文件中应改写为如下所示，`process.env.REACT_APP_RC1_IP` 访问的就是 env 中的环境变量，打包时会自动读取 production 中的配置，可以避免频繁更改代码

```js
registerMicroApps([
  {
    name: 'qiankun-app1',
    entry: process.env.REACT_APP_RC1_IP,
    container: '#app1',
    activeRule: '/micro-app1',
  },
  {
    name: 'qiankun-app2',
    entry: process.env.REACT_APP_RC2_IP,
    container: '#app2',
    activeRule: '/micro-app2',
  },
]);
```

### nginx 配置

需要注意的是，生产环境中主应用想要访问子应用，需要在 nginx 配置中手动添加允许访问，否则会出现 CROS 跨域问题，该 nginx 配置可直接使用，只需修改项目的存放地址即可，其它 nginx 相关内容暂不赘述。

```bash
# 主应用
server {
    listen       3000;
    server_name  localhost;

    location / {
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';

        root   /www/project/qiankun/app;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
}

# micro-app1
server {
    listen       1111;
    server_name  localhost;
    root   /www/project/qiankun/app1;

    location / {
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        try_files $uri $uri/ /index.html;
    }
}

# micro-app2
server {
    listen       2222;
    server_name  localhost;
    root   /www/project/qiankun/app2;

    location / {
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        try_files $uri $uri/ /index.html;
    }
}
```

重启 nginx 服务，就可以访问这三个应用，独立访问或者 qiankun 模式访问都可以

## 问题记录

### 由于 qiankun 子应用嵌套 div 导致无法设置高度 100%

如图所示，思路很清晰，给两个 div 设置高度 100%

![image](https://jsonq.top/cdn-static/2025/02/25/1740465692644-s0bfxcoo.png)

#### 给挂载节点设置高度 100%

之前是直接在 jsx 中这么写的

```js
<div id="cra" />
<div id="rc" />
```

可以动态的给 div 添加类名，当命中该容器时，给该容器设置 100% 高度，反之则取消高度 100%

```js
<div id="cra" className={pathname.startsWith("/cra") ? "h-full" : ""} />
<div id="rc" className={pathname.startsWith("/rc") ? "h-full" : ""} />
```

当路由是以 `/cra` 开头时，说明打开的时 `cra` 这个子应用，此时就设置其高度 100% 即可。

> 其实渲染这部分更推荐将注册子应用的数据进行抽离，挂载容器循环渲染，减小耦合度

#### 给嵌套的 div 设置高度 100%

有人会疑问？这不是有 id 吗？直接用这个 id 进行样式重置不就行了？答：这个 div 的 id 是 `qiankun` 自动生成的，不建议直接使用此 id 进行 div 的样式修改

其实可以通过这个 div 的 `data attribute` 进行样式选择，`data-name` 就是注册时的 name 名称，用这个明显更为可靠

![image](https://jsonq.top/cdn-static/2025/02/25/1740465692755-vw42mla7.png)

所以 css 应该这么写（在主应用的 css 中进行全局重置即可）

```css
/* 子应用注册时的 name */
div[data-name='cra'],
div[data-name='rc'] {
  height: 100%;
}
```

### 开启样式隔离导致首次加载 modal/drawer 等挂载类组件样式丢失

问题复现：

子应用中按钮点击弹出 modal，若子应用为第一次加载（子应用刷新浏览器或者从别的页面第一次切到该子应用），modal 样式丢失，只要进行一次路由切换，就会恢复

![image](https://jsonq.top/cdn-static/2025/02/25/1740465692992-s2bpndca.gif)

解决方法：关闭 `experimentalStyleIsolation` 样式隔离，即主应用的 `start()` 中删除配置，改成 css module 进行样式隔离（推荐）

> antd Modal 的 `getContainer` 可以指定挂载到当前位置，虽然 Modal 可以正常弹出，但是会改变页面的布局，可自行尝试，所以最佳方法还是使用 css module 替换 qiankun 自带的样式隔离
