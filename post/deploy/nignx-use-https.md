---
title: Nginx 离线配置 ssl 证书使用 https
date: 2024-04-07
---

纯离线的内网环境中使用 nginx 配置 ssl 并使用 https 访问网站。对于服务器中 nginx 及其它环境的搭建，可参考我的该文章 [Linux Centos7 离线部署 SpringBoot 前后端分离项目](/post/deploy/linux-offline-deploy.md)，该文章的环境是以此文章的基础上进行搭建的。同时，该文章涉及的部分安装包已提供在以上文章的开头部分。

# 检查环境

进入 nginx 的安装目录（一般是 `/usr/local/nginx`），检查是否有 ssl 模块

```bash
cd /usr/local/nginx # 进入 nginx 安装目录
cd /sbin # 进入 sbin 目录
./nginx -V # 查看 nginx 的版本及相关配置
```

> `V` 一定要是大写，小写只显示版本号。如果出现 `configure arguments: --with-http_ssl_module`，则跳过该步骤。

![image](https://img.jsonq.top/blog/2025/2/25/1740465680546-oyhebmq7.png)

# 安装 openssl

想要使用 ssl 配置 https，环境中必须有 openssl。openssl 下载地址：https://www.openssl.org/source/ 。也可以去官方的 release 上寻找更多版本下载：https://github.com/openssl/openssl/releases

> 由于之前已有留存 openssl 安装包，所以使用的 `openssl-1.1.1u` 版本，此次文章的演示也是如此。最新的 `openssl-3.x` 不确定是否与此版本完全兼容，若出现额外问题，需自行解决。

![image](https://img.jsonq.top/blog/2025/2/25/1740465680642-3r19dg58.png)

上传 openssl 压缩包到指定的存放目录，例如我的存放目录：`/data/software/nginx-deps` 解压 openssl 压缩包

```bash
cd /data/software/nginx-deps
tar -zxvf openssl-1.1.1u.tar.gz  # 解压 openssl 压缩包
cd openssl-1.1.1u
./config
```

如果执行 `./config` 出现如下错误信息，需根据提示安装 perl5，若没有则跳过

![image](https://img.jsonq.top/blog/2025/2/25/1740465680808-3z93wsht.png)

## 安装 perl5

去 perl 官网下载：https://www.perl.org/get.html

![image](https://img.jsonq.top/blog/2025/2/25/1740465680942-citaf8kl.png)

上传到服务器，解压

```bash
tar -zxvf perl-5.38.2.tar.gz
cd perl-5.38.2 # 进入 perl 目录
```

然后执行命令

```bash
./Configure -des -Dprefix=$HOME/localperl
make
make install
```

> 这个过程可能会比较漫长，如果环境中缺失 `gcc` 等，也会出现莫名其妙的错误，nginx 的离线配置可参考我的另一篇文章：[Linux Centos7 离线部署 SpringBoot 前后端分离项目](/post/deploy/linux-offline-deploy.md)

等待安装完成之后，就可以重新回到 openssl 安装的部分了。

## 再次安装 openssl

perl5 安装完毕，回到 opennssl 目录下，继续执行之前的操作，此时就不会报错了

```bash
cd openssl-1.1.1u
./config
```

# 安装 ssl 模块

一般是没有 ssl 相关模块的，此时进入到 **解压缩目录** 注意：<strong style="color:red;">是解压缩目录，因为是离线安装，必定需要上传 nginx 的压缩包进行解压，然后执行完 `./configure` 之后，一般才会将 nginx 安装到 `/usr/local/nginx` 路径下</strong> **此处以我的安装目录为例**：解压缩 nginx 的目录是 `/data/software/nginx`，安装后的目录是 `/usr/local/nginx`，则此时我需要进入 `/data/software/nginx` 进行之后的操作

```bash
# 进入我的 nginx 解压缩目录
cd /data/software/nginx

# 执行如下命令
./configure --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module
```

然后执行 `make` 命令

```bash
make # 此处切记不要执行 make install，否则会重新安装 nginx
```

执行完以上操作后，使用 xftp 等工具查看 nginx 目录，此时会发现目录下多出一个 objs 文件夹，文件夹内存在 nginx 文件

![image](https://img.jsonq.top/blog/2025/2/25/1740465681049-5itfdx2g.png)

[image](https://img.jsonq.top/blog/2025/2/25/1740476367992-np8cuuud.png)

停止 nginx 服务，用 objs 下的 nginx 文件替换掉 `/usr/local/nignx/sbin` 目录下的 nginx 执行文件

```bash
cd /usr/local/nginx/sbin
./nginx -s stop # 停止 nginx 服务
cp /data/software/nginx/objs/nginx /usr/local/nginx/sbin # 替换掉 sbin 下的 nginx 文件
```

![image](https://img.jsonq.top/blog/2025/2/25/1740465681181-p3dgqc9z.png)

查看 nginx 是否已配置号 ssl 模块，出现 `configure arguments: --with-http_ssl_module`,证明安装成功，如果此步就出现找不到 `nginx.pid` 的错误，可直接跳过看下边的解决方法。

```bash
./nginx -V
```

![image](https://img.jsonq.top/blog/2025/2/25/1740465681279-uw2cdfoi.png)

如果执行 `-V` 时出现权限补足，可给 nginx 文件提权

![image](https://img.jsonq.top/blog/2025/2/25/1740465681449-c9xhn5gy.png)

[image](https://img.jsonq.top/blog/2025/2/25/1740476430852-b7trcl32.png)

重启 nginx

```bash
./nginx
```

此时如果报错：`nginx: [error] open() “/usr/local/nginx/logs/nginx.pid” failed (2: No such file or directory)` 进入 logs 文件，发现 `nginx.pid` 确实没有了，执行如下命令

```bash
# 指定 nginx.conf 文件的位置
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
```

再次执行 `./nginx` 即可

# https 配置(80 跳 443)

部分浏览器，如果直接地址栏输入 ip 地址或者域名，会自动以 https 访问，若网站没有配置 `80(http)` 跳 `443(https)`，就会访问失败。以上步骤已经将 ssl 环境搭建完毕，该步骤只涉及两个东西：`ssl 证书` 和 `nginx.conf` 文件。

> 下载时，一定要下载 Apache/Nginx 的证书文件，不能下载其它系统环境的证书使用。

---

不管是自签证书还是正规的 ca 证书，都会有两个证书文件： `cert` 和 `key`，文件后缀可能比较多，比如 `pem 和 key` 或者 `crt 和 key`，能区分 `cert` 和 `key` 就行。

![image](https://img.jsonq.top/blog/2025/2/25/1740465681540-fgdl8n2y.png)

将这两个文件上传到服务器上，例如我上传到 `/data/software/nginx-ssl/` 目录下，上传完毕之后，就可以开始更改 `nginx.conf` 文件了。

**注意：这里的后端也设置 https** 。在不设置 https 时，访问后端资源，比如 swagger，如果出现 swagger 资源加载失败的情况，就需要后端也设置 https 了（该情况未测试，可酌情尝试）

```bash
http {
    # 监听 80 端口，自动重定向 443
    server {
        listen       80;
        server_name  mydomain.com; # ip 或者域名
        rewrite ^(.*)$ https://$server_name$1 permanent; # 这里的重定向方式有好几种，任意一种都可以

        # 由于 https 的配置都在 443 中，这里之后的内容都没用，删了也可以
    }


    # HTTPS server
    #
    server {
        listen       443 ssl;
        server_name  mydomain.com;

        ssl_certificate      /data/software/nginx-ssl/cert.crt; # 存放 cert 的路径
        ssl_certificate_key  /data/software/nginx-ssl/key.key; # 存放 key 的路径

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;

        location / {
          root /data/web/dist; # 前端的路径地址，访问 mydomain.com 就可以
          try_files $uri $uri/ /index.html;
          index index.html index.htm;
        }

        location /japi {
        # 本地资源映射，前端访问以 /japi 的资源时，都会被转发到 https://localhost:9999/japi 的资源上
        # 比如访问 https://mydomain.com/japi/doc.html 时，就会被映射到后台接口 https://localhost:9999/japi/doc.html
        proxy_pass https://localhost:9999/japi;
        proxy_set_header x-forwarded-for  $remote_addr;
      }
    }

}
```

如果做了本地资源映射，非必要情况下，可以只放开 80 和 443 端口（默认端口，如 22 等除外）。
