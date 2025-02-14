## SDK 接入使用

在使用腾讯地图 API 之前，首先要去 [官网](https://lbs.qq.com/) 进行账号注册

- 申请开发者秘钥：[申请秘钥](https://lbs.qq.com/dev/console/application/mine)
  - 点击 **创建应用**，输入 应用名称 和 应用类型
- 开通 webserviceAPI 服务：
  - 控制台 -> 应用管理 -> [我的应用](https://lbs.qq.com/dev/console/key/manage) ->添加 key-> 勾选 WebServiceAPI -> 保存。
  - _(小程序 SDK 需要用到 webserviceAPI 的部分服务，所以使用该功能的 KEY 需要具备相应的权限)_
- 下载微信小程序 JavaScriptSDK，微信小程序 [JavaScriptSDK v1.1](https://mapapi.qq.com/web/miniprogram/JSSDK/qqmap-wx-jssdk1.1.zip) 、 [JavaScriptSDK v1.2](https://mapapi.qq.com/web/miniprogram/JSSDK/qqmap-wx-jssdk1.2.zip) 其中任意一个

- 安全域名设置，在 小程序管理后台 -> 开发 -> 开发管理 -> 开发设置 -> 服务器域名 中设置 request 合法域名，添加 https://apis.map.qq.com

使用示例一（搜索附近区域）：

```js
// 引入SDK核心类，js文件根据自己业务，位置可自行放置
import QQMapWX from '../../libs/qqmap-wx-jssdk.js';
let qqmapsdk;

Page({
  onLoad() {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '申请的key',
    });
  },
  onShow() {
    // 调用接口
    qqmapsdk.search({
      keyword: '酒店',
      success(res) {
        console.log(res);
      },
      fail(res) {
        console.log(res);
      },
      complete(res) {
        console.log(res);
      },
    });
  },
});
```

使用示例二：（定位当前位置）

```js
Page({
  // 点击获取当前位置信息及坐标
  getCurrentLocation() {
    // 任何参数都不传的情况下，默认获取当前位置信息
    qqmapsdk.reverseGeocoder({
      success(res) {
        console.log(res);
      },
      fail(res) {
        console.log(res);
      },
    });
  },
});
```

> 更多的要求及 API 可参考腾讯地图官网提供的小程序 SDK：https://lbs.qq.com/miniProgram/jsSdk/jsSdkGuide/jsSdkOverview

## 小程序 API 获取地理位置注意事项

通过小程序官方提供的 API，可以使用 `wx.getLocation` 获取当前位置的经纬度。

在 js 文件中使用该 API 之前，需要在 app.json 文件中声明，新增如下内容

```json
"permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的效果展示"
    }
  },
  "requiredPrivateInfos": [
    "getLocation"
  ],
```
