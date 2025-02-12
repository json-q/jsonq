## TS 项目构建 npm 出错

使用微信开发者工具构建 npm 时出现 `NPM packages not found. Please confirm npm packages which need to build are belong to miniprogramRoot directory…` 的错误

在根目录 `project.config.json` 文件的 settings 中添加如下配置，主要作用是重定向读取的位置

```json
{
  "settings": {
    // ...
    "packNpmManually": true,
    "packNpmRelationList": [
      {
        "packageJsonPath": "./package.json",
        "miniprogramNpmDistDir": "./miniprogram/"
      }
    ]
  }
}
```

然后重启项目，不重启项目可能依旧报错，重启之后点击 [ 构建 npm ] 即可。

## 引用 lodash 报错

lodash 有相当一部分方法都是在浏览器环境下运行的，小程序的运行环境和浏览器不一样。  
解决方法：新建一个 `lodash-fix.js` 将以下内容复制进去，在引用 lodash 的地方之前引入该文件即可。

```js
/* eslint-disable */
global.Object = Object;
global.Array = Array;
// global.Buffer = Buffer
global.DataView = DataView;
global.Date = Date;
global.Error = Error;
global.Float32Array = Float32Array;
global.Float64Array = Float64Array;
global.Function = Function;
global.Int8Array = Int8Array;
global.Int16Array = Int16Array;
global.Int32Array = Int32Array;
global.Map = Map;
global.Math = Math;
global.Promise = Promise;
global.RegExp = RegExp;
global.Set = Set;
global.String = String;
global.Symbol = Symbol;
global.TypeError = TypeError;
global.Uint8Array = Uint8Array;
global.Uint8ClampedArray = Uint8ClampedArray;
global.Uint16Array = Uint16Array;
global.Uint32Array = Uint32Array;
global.WeakMap = WeakMap;
global.clearTimeout = clearTimeout;
global.isFinite = isFinite;
global.parseInt = parseInt;
global.setTimeout = setTimeout;
```
