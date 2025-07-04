---
title: 前端本地开发使用 pnpjs 代理 Sharepoint 联调
date: 2025-05-26
---

网上没找到类似的解决方案，遂水一下。Sharepoint 虽然有提供 [web 开发的文档](https://learn.microsoft.com/zh-cn/sharepoint/dev/spfx/web-parts/get-started/build-a-hello-world-web-part)，但必须使用 microsoft 官方的脚手架，且页面的定制化能力极低（自带 Sharepoint 的部分导航内容），这与我们期望的大相径庭。

我们的期望：仅使用 Sharepoint 作为静态资源的存放处（跟服务器的概念类似），其余所有内容都是纯定制化开发

> 个人感觉 Sharepoint 是最纯粹的低代码平台，完全的自定义开发 + 最细粒度的权限控制，可以让我们完全只关系 web 开发即可。国内的所谓低代码，不管是金蝶还是用友的系统，在其 Sharepoint 面前都是小儿科玩具，什么拖拽表单生成页面，一点意义都没有。

## 背景

在原来的开发模式下，以类似于 html 的方式使用 `react + babel` 编译进行开发，这也可能是当时最简单便捷的方式。因为 Sharepoint 提供的 `CamlQuery` ，只有在基于母版页的 `aspx` 页面中，才有权限调用，这也就为什么脚手架项目没有被使用（因为本地开发的 html，无法被 sharepoint 母版页支持）。

由于初期的开发模式维护极难，以及各种历史遗留问题，在原有开发模式的基础上再新增项目模块已经非常困难了。由于某些事情，最终决定对较为特殊的移动端模块进行重写，摒弃之前的模式，也就有了这篇文章。

## pnpjs 代理到 Sharepoint

好了，废话不多说，来聊聊本地项目如何使用 `pnpjs` 代理到 Sharepoint，其中也进行了很多的尝试，最终的方法简单的有点离谱，使用 [sp-rest-proxy](https://github.com/koltyakov/sp-rest-proxy) 即可。

首先非 `aspx` 的页面是无权调用 REST API 的，意味着你的 `localhost` 无法访问 `mysharepoint.com` 的任何资源，因为 Sharepoint 根本不知道你是哪个用户，是不可能放行访问的。

因此做账号认证是必须的，但是我们对 Sharepoint 的认证完全找不到接口，在经历多次尝试基本放弃此方案的时候，我们发现了 `sp-rest-proxy` 这个库，而且使用非常简单。

1. 安装 `sp-rest-proxy`
2. 新建一个 js 文件，并引入 `sp-rest-proxy`。

   ```js
   const RestProxy = require('sp-rest-proxy');
   const restProxy = new RestProxy({
     configPath: 'private.json', // 指定生成的配置文件路径
     port: 9999, // 代理端口
     protocol: 'https',
   });
   ```

3. 运行这个 js 文件，在没有配置文件存在时，会给出步骤指引，输入账号密码以及认证方式即可。
4. 在前端项目中配置 pnpjs 的 `SPBrowser` 配置请求地址即可。

   ```ts
   import { spfi, SPBrowser } from '@pnp/sp';
   // 引入 pnpjs 的常用模块
   import '@pnp/sp/webs';
   import '@pnp/sp/lists';
   import '@pnp/sp/items';
   import '@pnp/sp/attachments';
   import '@pnp/sp/files';
   import '@pnp/sp/folders';
   import '@pnp/sp/site-users/web';

   // v4 的写法
   export const sp = spfi().using(
     SPBrowser({
       baseUrl: 'https://localhost:9999',
     }),
   );
   ```

OK，此时我们就能愉快的调用 pnpjs 的方法了。比如 `sp.web.currentUser()` 等等。

> 在此方案下，本地使用代理请求 Sharepoint 资源，部署时，将构建好的资源放在 Sharepoint 中，并在 aspx 中引入（aspx 可以理解为一个 html 模板）

## v4 与 v3 的写法区别

### 数据请求

在普通数据请求方面，v4 和 v3 中的区别不大，v4 移除了 `get` 调用

```ts
// v4
sp.web.lists.getByTitle('myTitle').items.filter(`xyz eq '123'`)();
// v3
sp.web.lists.getByTitle('myTitle').items.filter(`xyz eq '123'`).get();
```

### 站点绑定

在使用子站点的数据表时

```ts
// v4
import { Web } from '@pnp/sp/webs';
const webSite = Web([sp.web, 'childSite']);

// v3 这个是引入的全量 pnpjs 离线包, 不是 esm
const webSite = pnp.SPNS.Web('childSite');
```

### 数据附件

数据附件上传，移除了 `addMultiple`，仅保留 `add`

```js
// v4
sp.lists
  .getByTitle('myTitle')
  .items.getById(1)
  .attachmentFiles.add(fileData.fileName, fileData.file);

// v3
sp.lists
  .getByTitle('myTitle')
  .items.getById(1)
  .attachmentFiles.addMultiple([{ name: fileData.fileName, content: fileData.file }]);
```

数据附件获取，移除了 `get` 调用

```js
// v4
sp.lists.getByTitle('myTitle').items.getById(1).attachmentFiles();

// v3
sp.web.lists.getByTitle('myTitle').items.getById(1).attachmentFiles.get();
```

还有文档库什么的，也有细微的调整，都是移除了一些方法，这里就不一一列举了，自行查看文档。
