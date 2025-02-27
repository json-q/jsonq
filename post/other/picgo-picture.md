---
title: 使用 PicGo + Github + jsdelivr 搭建图床
date: 2025-02-27
---

其实没什么好说的，PicGo 的官方教程写的很明白，所以搭建 Github 图床这一部分就不说了，就说一下 jsdelivr 的 cdn 加速和自定义域名

PicGo 的自定义域名添加 `https://cdn.jsdelivr.net/gh/[账号名]/[仓库名]@[分支]`

分支大部分都是 main 分支，因为 GitHub 的默认主分支就是 main

上传完毕之后，就可以通过 jsdelivr 来访问图片了

## jsdelivr 替代节点

由于 jsdelivr 的节点经常被 dns 污染导致无法访问，所以这里列举几个备用节点

| 节点 | 来源 | 国内访问速度 | 优点 | 缺点 |
| --- | --- | --- | --- | --- |
| gcore.jsdelivr.net | Gcore | ⭐️⭐️⭐️⭐️ | 可用性高【推荐】 | 国内速度一般 |
| testingcf.jsdelivr.net | Cloudflare | ⭐️⭐️⭐️⭐️ | 可用性高【推荐】 | 国内速度一般 |
| quantil.jsdelivr.net | Quantil | ⭐️⭐️⭐️⭐️⭐️ | 国内访问速度快 | 国内部分线路不太稳定 |
| fastly.jsdelivr.net | Fastly | ⭐️⭐️⭐️⭐️⭐️ | 国内访问速度快 | 国内部分线路不太稳定 |
| originfastly.jsdelivr.net | Fastly | ⭐️⭐️⭐️⭐️⭐️ | 国内访问速度快 | 国内部分线路不太稳定 |
| cdn.jsdelivr.net | 官方 | ⭐️⭐️ | 官方平台 | 不稳定, 国内偶尔打不开 |
| jsd.cdn.zzko.cn | 第三方(国内) | ⭐️⭐️⭐️⭐️⭐️ | 国内访问速度超快 | 可靠性未知 |

如果要使用这些节点，就是把 `cdn.jsdelivr.net` 替换成对应的节点名

## 自定义域名

说实话，没成功，域名的路径转发倒是成功了，但是二级域名的转发就失败，尝试了以下操作都没成功。

- 配置 nginx，将二级域名转发到 jsdelivr 的 cdn 域名上，然后配置二级域名的 A 记录指向 服务器 ip
- 不配置 nginx，直接用 dns 解析 CNAME 到 jsdelivr 的 cdn 域名

以上两种情况，都是提示 `使用了不受支持的协议`，Fuck!

没办法了，一级域名的路径转发凑合用吧

```bash
proxy_cache_path /tmp/cache levels=1:2 keys_zone=jsdelivrcache:100m inactive=1d max_size=5g;
server {
    location ^~ /cdn-static/ {
        proxy_pass https://jsonq.top/cdn-static/;
        proxy_cache jsdelivrcache;
        expires 30d;
    }
}
```

## 优势

如果域名失效或者服务器不用了，图片资源还是存在的，而且有相当多层的保险

- `https://jsonq.top/cdn-static/xxx`
- `https://testingcf.jsdelivr.net/gh/json-q/picture-blog@main/xxx`
- `https://cdn.jsdelivr.net/gh/json-q/picture-blog@main/xxx`
- `https://raw.githubusercontent.com/json-q/picture-blog/main/xxx`

如果 jsdelivr 也不可用了，那就只剩下 github 了，但是只要图片资源保留，一切都是有机会的
