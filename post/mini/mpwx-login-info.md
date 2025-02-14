---
title: 微信授权登录及信息填写
date: 2023-09-03
---

## 对接后台登录流程

先上官方的经典登录流程图：

![登录流程时序](https://static.jsonq.top/2024/10/21/143941055_f3382488-2c4f-4567-b865-f64470ef702a.jpg)

步骤拆分解析：

1. 前端通过 **调用官方 API `wx.login`**，将回调中的 `code` 临时**登陆凭证传递给（请求）后台**
2. 后台去请求微信的接口 `https://api.weixin.qq.com/sns/jscode2session`。具体用法参考 [官方文档](https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html)
3. 后台请求该接口的响应成功的数据中可以拿到两个值 `openid` 和 `session_key`。**其中 `openid` 是唯一值，可以当作用户标识**，比如判断该用户是否存在，是否注册该用户等。`session_key` 自行处理。

如果需要获取用户信息（**现在用户信息毛都没有，获取也没用**），需要在 `wx.login` 之前调用 `wx.getUserProfile` 将 `rawData` 和 `signature` 联合 code 一并传递给后台，后台通过 `session_key` 和 `rawData` 来**反解析** `signature` 的正确性。

:::info{title=提示} 根据现在微信官方的说法，注册时添加微信用户真实信息（头像昵称）是不可能的，前后端交互时，通过 `wx.login` 传递一个 code 仅注册就可以，其它参数目前完全没用 :::

### 前端代码

```js
// wx.getUserProfile({
//   desc: '获取用户信息',
//   success: (InfoRes) => {
//     console.log('InfoRes', InfoRes);
wx.login({
  success(res) {
    wx.request({
      url: 'http://localhost:8888/testApi/wx/login',
      data: {
        // encryptedData 和 iv 是用来解析私密用户信息的，但是现在啥也获取不到了，所以没用
        code: res.code,
        // encryptedData: InfoRes.encryptedData,
        // iv: InfoRes.iv,
        // rawData: InfoRes.rawData,
        // signature: InfoRes.signature,
      },
    }).then((res) => {
      // 登录认证成功，后台一般会返回登陆凭证（token），存储使用即可
    });
  },
  fail(err) {
    console.log(err.errMsg);
  },
});
//   },
// });
```

### 后端代码

#### 请求第三方

请求第三方接口，这里采用两种方式，选择其中一种即可。

1. pom 中集成 httpclient 包。

HttpClientUtils

```java
public class HttpClientUtil {
    public static String doGet(String url, Map<String, String> param) {

        // 创建Httpclient对象
        CloseableHttpClient httpclient = HttpClients.createDefault();

        String resultString = "";
        CloseableHttpResponse response = null;
        try {
            // 创建uri
            URIBuilder builder = new URIBuilder(url);
            if (param != null) {
                for (String key : param.keySet()) {
                    builder.addParameter(key, param.get(key));
                }
            }
            URI uri = builder.build();

            // 创建http GET请求
            HttpGet httpGet = new HttpGet(uri);

            // 执行请求
            response = httpclient.execute(httpGet);
            // 判断返回状态是否为200
            if (response.getStatusLine().getStatusCode() == 200) {
                resultString = EntityUtils.toString(response.getEntity(), "UTF-8");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (response != null) {
                    response.close();
                }
                httpclient.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return resultString;
    }

    public static String doGet(String url) {
        return doGet(url, null);
    }

    public static String doPost(String url, Map<String, String> param) {
        // 创建Httpclient对象
        CloseableHttpClient httpClient = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        String resultString = "";
        try {
            // 创建Http Post请求
            HttpPost httpPost = new HttpPost(url);
            // 创建参数列表
            if (param != null) {
                List<NameValuePair> paramList = new ArrayList<>();
                for (String key : param.keySet()) {
                    paramList.add(new BasicNameValuePair(key, param.get(key)));
                }
                // 模拟表单
                UrlEncodedFormEntity entity = new UrlEncodedFormEntity(paramList);
                httpPost.setEntity(entity);
            }
            // 执行http请求
            response = httpClient.execute(httpPost);
            resultString = EntityUtils.toString(response.getEntity(), "utf-8");
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                response.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return resultString;
    }

    public static String doPost(String url) {
        return doPost(url, null);
    }

    public static String doPostJson(String url, String json) {
        // 创建Httpclient对象
        CloseableHttpClient httpClient = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        String resultString = "";
        try {
            // 创建Http Post请求
            HttpPost httpPost = new HttpPost(url);
            // 创建请求内容
            StringEntity entity = new StringEntity(json, ContentType.APPLICATION_JSON);
            httpPost.setEntity(entity);
            // 执行http请求
            response = httpClient.execute(httpPost);
            resultString = EntityUtils.toString(response.getEntity(), "utf-8");
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                response.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return resultString;
    }
}
```

使用

```java
Map<String, String> params = new HashMap<>();
// .... 参数添加 params.put("...","...")
String s = HttpClientUtil.doPost(url, params);
SONObject object = JSON.parseObject(s);
```

2. 使用 Springboot 自带的 RestTemplate

RestTemplateUtil

```java
public class RestTemplateUtil {
    public static JSONObject doPost(String url, MultiValueMap<String, Object> param){
        RestTemplate restTemplate=new RestTemplate();
        String s = restTemplate.postForObject(url, param, String.class);
        return JSONObject.parseObject(s);
    }
}
```

使用

```java
MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
// .... 参数添加 params.add("...","...")
JSONObject object = RestTemplateUtil.doPost(url, params);
```

#### 登录流程对接

```java
// 现在 rawData 和 signature 已经没什么用了，所以这两个参数相关的逻辑可以删除，此处保留仅做记录
public R wxLogin(String code) {
    String url = "https://api.weixin.qq.com/sns/jscode2session";
    MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
    params.add("appid",appid);
    params.add("secret",secret);
    params.add("js_code",code);
    params.add("grant_type",grantType);
    JSONObject object = RestTemplateUtil.doPost(url, params);
    System.out.println(object);
    //接收微信接口服务 获取返回的参数
    String openid = object.getString("openid");
    String sessionKey = object.getString("session_key");
    //校验签名 小程序发送的签名signature与服务器端生成的签名signature2 = sha1(rawData + sessionKey)
    // String signature2 = DigestUtils.sha1Hex(rawData + sessionKey);
    // System.out.println(signature2);
    // System.out.println(openid);
    // if(!signature.equals(signature2)){
    //     return R.fail("签名校验失败");
    // }
    // SONObject rawDataJson = JSONObject.parseObject(rawData);
    // return R.ok(rawDataJson);

    // --------这里可以使用 openid 判断用户是否注册，将用户信息插入数据库
}
```

## 获取用户信息

通过 API 调用方式直接获取用户信息的方式已经完全没有了，只能让用户自己手动完善个人信息，类似于表单填写，但在此基础上，微信官方提供了相应的开放能力。

> 此处使用原生的小程序做示例，Taro 和 uniapp 的使用逻辑相同。

### 获取用户昵称

小程序的 input 组件配置 `type="nickname"`

```html
<input type="nickname" model:value="{{ nameValue }}" placeholder="请输入昵称" />
```

```js
Page({
  data: {
    nameValue: '',
  },

  onLoad(options) {
    const { name } = options;
    this.setData({
      nameValue: name,
    });
  },

  onSubmit() {
    console.log(this.data.nameValue);
  },
});
```

![获取用户昵称示意图](https://static.jsonq.top/2024/10/21/143942685_a2f75f23-409d-4c87-acd1-7b7f09b3120d.png)

### 获取用户头像

小程序的 button 组件需设置 `open-type="chooseAvatar"`，并绑定对应的事件，获取用户的（上传）头像临时地址，将其传给后端进行信息保存。

```html
<button open-type="chooseAvatar" bind:chooseavatar="onChooseAvatar">
  <image src="{{ avatarUrl }}" />
</button>
```

```js
const defaultAvatarUrl =
  'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    avatarUrl: defaultAvatarUrl,
  },

  async onChooseAvatar(e) {
    const { avatarUrl = '' } = e.detail;
    const { data, code } = await uploadImg(avatarUrl);
    code === 200 &&
      this.setData({
        avatarUrl: data,
      });
  },
});
```

![获取用户头像示意图](https://static.jsonq.top/2024/10/21/143944057_bba20fa7-15d3-4736-bf93-c8cfc96cc319.png)
