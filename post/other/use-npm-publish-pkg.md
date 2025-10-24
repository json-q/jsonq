---
title: 如何发布一个 npm 包
date: 2025-10-22
---

1. 去 [npm](https://www.npmjs.com) 创建账号，如果提示需要 2FA 认证，可以去完善，选择第一个（第二个是扫码什么的，不会弄）

![image](https://jsonq.top/cdn-static/2025/10/22/202510221043357.png)

2. 新建一个项目，写点内容
3. 补充 `package.json`

```json
{
  "name": "my-package", // 包名，名字不能重复
  "description": "this is a description",
  "keywords": ["keyword1", "keyword2"],
  "version": "0.0.1", // 版本号
  "type": "module",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/xxx.git"
  },
  "homepage": "https://github.com/xxx",
  "types": "./es/index.d.ts",
  // 如果你提供了 commonjs 的包，那就需要添加 exports 字段并补充 require 的文件指向，如果纯 esm 包可省略
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js"
    }
  },
  // 告诉 npm 包，哪些文件需要发布，npm 会默认发布 package.json README.md LICENSE
  "files": ["dist", "es"],
  // 表明你的代码是否存在副作用 一般纯 js 包没有副作用 可以被构建工具更好的 tree-shaking
  "sideEffects": false,
  "scripts": {
    "build": "rslib build",
    "dev": "rslib build --watch"
  },
  "devDependencies": {}
}
```

发布完大概就是如下所示的目录结构

![image](https://jsonq.top/cdn-static/2025/10/22/202510221048196.png)

4. 上传至 github
5. 如果使用 npm 镜像，需要切换会 npm 源 `npm config set registry https://registry.npmjs.org/`
6. `npm login` 登录 npm，这里现在是直接让你 Enter 打开浏览器进行认证登录，比较方便

![image](https://jsonq.top/cdn-static/2025/10/22/202510221038798.png)

7. `npm publish` 发布

![image](https://jsonq.top/cdn-static/2025/10/22/202510221040976.png)

此时就可以去 npm 上查看到发布的包了，由于数据同步不是实时的，所以刚开始是搜索不到的

8. `npm version patch` 更新小版本，执行命令后，npm 会自动更改 package.json 的版本号，同时会给你的 git 仓库打一个 tag，你可以把这个 tag 推送到远程仓库

> 发布 主版本号(major).次版本号(minor).补丁版本号(patch) 也是同理执行对应的命令即可

![image](https://jsonq.top/cdn-static/2025/10/22/202510221044821.png)

9. `npm publish` 发布小版本
