---
title: Taro 框架快速上手
date: 2024-02-26
---

对以 Taro 框架开发的项目进行部分总结。

# 快速上手

快速搭建 Taro 项目

```bash
# 全局安装 taro cli
npm install -g @tarojs/cli
# 使用 taro 命令初始化项目
taro init [项目名称]

# 或者直接使用 npx 安装
npx @tarojs/cli init [项目名称]
```

启动项目，查看 `package.json` 文件，其中 `dev` 相关的命令是开发过程中执行的，`build` 相关的命令是打包上传使用的。

```bash
npm run dev:weapp # 小程序开发执行命令
npm run build:weapp # 小程序打包上传执行命令

npm run dev:h5 # h5 开发执行命令
npm run build:h5 # h5 打包执行命令
```

> 更多初始化细节参考 [taro 官网](https://taro-docs.jd.com/docs/GETTING-STARTED)

## 使用路径别名

```js
// config/index.ts
import path from "path";

const baseConfig: UserConfigExport = {
  // ...
  alias: {
    "@": path.resolve(process.cwd(), "src"),
  },
};
```

## 区分生产和开发环境

生产和开发时调用的地址通常是不一样的，打包时直接自动替换，而非手动修改，也可尝试使用 .env 文件来做区分

```ts
// config/base_api.ts
const ENV_API = {
  development: 'http://10.xxx:8888/Api',
  production: 'https://101.xxx:8888/Api',
};

const BASE_API = ENV_API[process.env.NODE_ENV];

export default BASE_API;
```

## Taro 项目版本更新

更新 Taro 项目所在的依赖

```bash
# 使用 npm 安装 CLI
$ npm install -g @tarojs/cli
# OR 使用 yarn 安装 CLI
$ yarn global add @tarojs/cli


# 使用Taro 升级命令更新CLI版本到最新版本
$ taro update self

# 使用Taro 升级命令更新CLI版本到指定版本
$ taro update self [版本号]

# 使用Taro 升级命令将项目依赖升级到与@tarojs/cli一致的版本
$ taro update project

# 使用Taro 升级命令将项目依赖升级到指定版本
$ taro update project [版本号]
```

## h5 跨域和区分生产环境进行项目打包

运行和打包时，所有的资源都会被打包到 dist 文件夹下，这使得每次只能打包一个环境的文件。

config/index.ts

```ts
export default defineConfig(async (merge) => {
  const baseConfig: UserConfigExport = {
    sourceRoot: 'src',
    // 不同环境运行和打包到不同文件夹下
    outputRoot: `dist/${process.env.TARO_ENV}`,
    alias: {  // 路径别名
      '@': path.resolve(process.cwd(), 'src'),
    },
    h5: {
      // h5 端的跨域代理
      devServer: {
        proxy: {
          '/api': {
            target: 'https://xxx.com/sw/Uapi',
            changeOrigin: true,
            pathRewrite: {
              '/api': '/',
            },
          },
        },
      },
    },
});
```

> **打包上传时，一定要执行 build 命令**。dev 下的 --watch 会增加大量运行时的 `runtime` 文件，不能作为上线的最终产物。

分运行环境打包时，针对小程序端，还要做额外处理

project.config.json

```json
{
  // root 路径需要更改
  "miniprogramRoot": "./dist/weapp",
  "appid": "",
  "setting": {
    "urlCheck": true,
    "es6": false,
    "enhance": false,
    "compileHotReLoad": false,
    "postcss": false,
    "minified": false
  },
  "compileType": "miniprogram"
}
```

# 社区产物

taro 的社区确实不太好，由于 taro3 的破坏式更新，导致很多之前的社区库无法适配 taro3 而停止维护，勉强找了几个较为合适的。

## 路由

不管是 uniapp 或者 taro 开发，都离不开路由传参。少量参数可以通过 url 地址拼接，但是大量的复杂数据，想要通过 url 传参是不现实的，因为 url 传参的大小是有限制的，可能会造成数据截断。

分析官方提供的常用路由传参方式。

### url 拼接传参(Taro 版)

传参

```js
Taro.navigateTo({
  url: '/pages/page/path/name?id=2&type=test',
});

const list = [
  { name: '张三', age: 10 },
  { name: '李四', age: 20 },
];

Taro.navigateTo({
  url: `/pages/page/path?list=${JSON.stringify(list)}`,
});
```

接收参数

```js
useLoad((options) => {
  console.log(options);
  // console.log(JSON.parse(options));
});
```

### eventChannel

适合大量参数传递，仅支持微信小程序。[微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.navigateTo.html)

```js
// 向 pages.test 页面传递数据 list
Taro.navigateTo({
  url: '/pages/test',
  success: function (res) {
    // 通过eventChannel向被打开页面传送数据
    res.eventChannel.emit('acceptDataFromOpenerPage', { data: list });
  },
});
```

参数接收

```js
useLoad((option) => {
  const pages = Taro.getCurrentPages();
  const current = pages[pages.length - 1]; /* 从堆栈中获取当前界面的属性 */
  const eventChannel = current.getOpenerEventChannel();
  eventChannel.on('acceptDataFromOpenerPage', (options) => {
    console.log(options);
  });
});
```

### tarojs-router-next

- 自动生成带参数类型提示的路由方法
- 允许传递任意类型、任意大小的参数数据
- 同步的路由方法调用
- koa 体验一致的路由中间件

[官网](https://lblblib.gitee.io/tarojs-router-next/)

### 选择

页面之间传输的数据量大的情况下，如果只开发微信小程序端，可使用 enventChannel。若要兼容 h5 等多端，采用 `tarojs-router-next` 库。

## 组件库

目前使用下来，`@antmjs/vantui` 是体验最好的 Taro 组件库，具有较为丰富的功能组件，支持 h5 和微信小程序。<span style="color:blue;">对于有表单的场景，该组件库的提供的表单相关的能力还是很强的，官方和很多社区的组件库表单，都只有排版（有的甚至排版功能都没有），没有校验功能</span>

[文档地址](https://antmjs.github.io/vantui/main/#/home)

### 按需引入组件

- 安装 `babel-plugin-import`。

```bash
npm i babel-plugin-import -D
```

- 在 `.babelrc` 或 `babel.config.js` 中添加配置

```js
module.exports = {
  // ...
  plugins: [
    [
      'import',
      {
        libraryName: '@antmjs/vantui',
        libraryDirectory: 'es',
        style: (name) => `${name}/style/less`,
      },
      '@antmjs/vantui',
    ],
  ],
};
```

### 修改主题

此处可参考官方文档 [定制主题](https://antm-js.gitee.io/vantui/main/#/theme)

- 新建一个 less 文件，引入 vantui 的 less 变量，并对 less 主题色进行更改
- 将该 less 文件引入 app.ts 文件中

```css
@import '@antmjs/vantui/es/style/var.less';

:root,
page {
  /* 全局修改默认主题色 */
  --primary-color: #1989fa;
}
```

- 通过覆盖 less 主题方式修改。其中 `src/styles/index.less` 为修改 less 变量的文件，需要告诉 vantui，修改的主题在该文件下

```js
export default defineConfig(async (merge) => {
  const baseConfig: UserConfigExport = {
      mini: {
      lessLoaderOption: {
        lessOptions: {
          modifyVars: {
            hack: `true; @import "${path.join(process.cwd(), 'src/styles/index.less')}";`,
          },
        },
      },
    },
})
```

# 网络请求封装(TS 版本)

遵循小程序的网络请求标准，可以直接应用于原生小程序，也可以无缝切换为 uniapp。

```ts
import Taro from '@tarojs/taro';
import type { IRequestConfig } from './typings';
import { TOKEN_KEY } from '@/constants';
import BASE_API from 'config/base_api';

const H5 = process.env.TARO_ENV === 'h5'; // 是否是 H5 环境

// 枚举后台异常状态码
enum ErrorCode {
  UN_AUTH = 401, // 未授权或者 token 失效，需登录
  UNKNOWN = 500, // 服务异常
}

class HttpRequest {
  // 处理WX请求异常状态码。请求成功，但官方返回异常状态
  private handlerWXErrorStatus(errMsg: string, { toast = true }: IRequestConfig) {
    toast && Taro.showToast({ title: `${errMsg}，错误码：${statusCode}`, icon: 'none' });
  }

  // 处理WX请求异常。请求出错
  private handlerWXError(err: TaroGeneral.CallbackResult, { toast = true }: IRequestConfig) {
    let errMsg = '';
    if (/timeout/.test(err.errMsg)) {
      errMsg = '请求超时';
    }
    toast && Taro.showToast({ title: errMsg || err.errMsg, icon: 'none' });
  }

  // 处理后台异常状态码
  private responseInterceptorsHandler(code: number, msg = '') {
    switch (code) {
      case ErrorCode.UN_AUTH:
        this.handleNoAuth();
        break;
      default:
        Taro.showToast({ title: msg || '请求失败', icon: 'none' });
        break;
    }
  }

  // 处理登陆过期的问题
  private handleNoAuth = () => {
    Taro.clearStorageSync();
    Taro.showModal({
      title: '登陆提示',
      content: '未绑定账号或登录过期，请重新登录',
      showCancel: false,
      success(res) {
        if (res.confirm) Taro.reLaunch({ url: '/pages/my/index' });
      },
    });
  };

  // 服务器接口请求
  private request<T>(requestConfig: IRequestConfig): Promise<R<T>> {
    return new Promise((resolve, reject) => {
      // 默认header
      const contentType =
        requestConfig.method === 'GET' ? 'application/x-www-form-urlencoded' : 'application/json';
      const header = {
        'content-type': contentType,
        ...requestConfig.header,
        Authentication: Taro.getStorageSync(TOKEN_KEY), // 请求 token
      };
      // 是否显示loading，显示mask用于阻止用户多次点击
      if (requestConfig.loading) {
        Taro.showLoading && Taro.showLoading({ title: '加载中...', mask: true });
      }

      Taro.request({
        method: requestConfig.method,
        // h5 端需要代理跨域
        url: H5 ? `/api${requestConfig.url}` : `${BASE_API}${requestConfig.url}`,
        data: requestConfig.data,
        header,
        dataType: !requestConfig.dataType ? 'json' : '其他',
        success: (res) => {
          // 加载完成关闭提示框
          if (requestConfig.loading) {
            Taro.hideLoading && Taro.hideLoading();
          }
          //res:{cookies, data, header, statusCode}
          const statusCode = res.statusCode;
          const data = res.data as R<T>;

          // 先校验返回的状态码，非200状态码处理
          if (statusCode !== 200) this.handlerWXErrorStatus(res.errMsg, requestConfig);

          // 返回状态码无误，再校验 后台状态码
          if (data.code !== 200) this.responseInterceptorsHandler(data.code, data.msg);
          resolve(data);
        },
        fail: (err) => {
          this.handlerWXError(err, requestConfig);
          reject(err);
        },
      });
    });
  }

  // 仿 axios 请求方式
  public get<T>(url: string, otherConfig: IRequestConfig = {}) {
    return this.request<T>({ method: 'GET', url, ...otherConfig });
  }

  public post<T>(url: string, otherConfig: IRequestConfig = {}) {
    return this.request<T>({ method: 'POST', url, ...otherConfig });
  }

  public delete<T>(url: string, otherConfig: IRequestConfig = {}) {
    return this.request<T>({ method: 'DELETE', url, ...otherConfig });
  }

  public put<T>(url: string, otherConfig: IRequestConfig = {}) {
    return this.request<T>({ method: 'PUT', url, ...otherConfig });
  }
}

/**
 * @description 封装请求
 * 扩展功能：
 * - 统一错误提示，包括小程序本身和后台异常状态码，默认自动提示
 * - 可选的全局 loading
 * - 细化结果的返回类型
 */
const http = new HttpRequest();
export default http;
```

请求示例

```ts
import http from '@/utils/request';

export const fetchList = (params: Pagination) => {
  return http.get<List<MyList[]>>('/test/list', {
    data: params,
    loading: true,
  });
};
```

TS 类型定义文件

```ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type IRequestConfig = {
  /** API路径 */
  url?: string;
  /** Method类型 */
  method?: HttpMethod;
  /** 接口传参数据 */
  data?: object;
  /** 自定义请求头，合并 header 而非替换 */
  header?: IAnyObject;
  /** 返回的数据格式，默认值 json，对后台数据进行一次 JSON.prase */
  dataType?: 'json' | '其他';
  /** 请求报错时，是否弹出 Toast 的 message 提示（默认弹出：true）*/
  toast?: boolean;
  /** 请求时，是否加载 loading 框，默认不加载：false*/
  loading?: boolean;
};
```
