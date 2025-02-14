---
title: 免费无限续期 SSL 证书
date: 2024-11-12
---

# 免费无限续期 SSL 证书

要实现自动续期，至少需要有一台服务器，虚拟空间不行。

且如果要签泛域名证书的话，证书中包含的域名的 DNS 解析不用全部放在同一个地方，比如几个域名用 cloudflare 管理解析记录，另外几个用 DNSpod，这几个域名签进同一张泛域证书里，也是可以的。

## acme.sh

完成 SSL 自动续期的是一个开源脚本 -- `acme.sh`

- [Github 地址](https://github.com/acmesh-official/acme.sh)
- [中文说明](https://github.com/acmesh-official/acme.sh/wiki/%E8%AF%B4%E6%98%8E)
- [自动 DNS](https://github.com/acmesh-official/acme.sh/wiki/dnsapi) 只有英文说明

某 freessl.cn 里面的一元证书自动化就是用 acme 魔改的，用的还是特别老的 acme，教程也不全，效率很低。

下面就总结一下怎么用 `acme` 签多域泛域名证书。

# 使用 acme.sh

## 安装 acme

可以先安装一下依赖 socat，其实不装也没什么影响

```bash
# Centos
yum install socat -y
# Debian/Ubuntu
apt install socat -y

# install acme
curl https://get.acme.sh | sh
```

### Github 无法访问

国内主机可能无法访问 GitHub，需要以下步骤

- 打开 DNS 解析网址 https://tool.lu/dns/index.html ，查询有关与 github.com 域名相关的 IP 地址
- 将查询到的 A 类 IP 地址，写入到 hosts 文件下（Windows 和 Linux 都有该文件，但路径不同）
- 需要添加以下内容到 `/etc/hosts`（Linux）
  - `vi /etc/hosts`
  - `Ins` 快捷键进入编辑模式
  - 输入如下内容（此处仅列举大部分 dns 地址），并 `Esc` 退出编辑模式
  - `:wq` 保存并退出文件

```bash
140.82.114.25                 alive.github.com
140.82.112.25                 live.github.com
185.199.108.154               github.githubassets.com
140.82.112.22                 central.github.com
185.199.108.133               desktop.githubusercontent.com
185.199.108.153               assets-cdn.github.com
185.199.108.133               camo.githubusercontent.com
185.199.108.133               github.map.fastly.net
199.232.69.194                github.global.ssl.fastly.net
140.82.112.4                  gist.github.com
185.199.108.153               github.io
140.82.114.4                  github.com
192.0.66.2                    github.blog
140.82.112.6                  api.github.com
185.199.108.133               raw.githubusercontent.com
185.199.108.133               user-images.githubusercontent.com
185.199.108.133               favicons.githubusercontent.com
185.199.108.133               avatars5.githubusercontent.com
185.199.108.133               avatars4.githubusercontent.com
185.199.108.133               avatars3.githubusercontent.com
185.199.108.133               avatars2.githubusercontent.com
185.199.108.133               avatars1.githubusercontent.com
185.199.108.133               avatars0.githubusercontent.com
185.199.108.133               avatars.githubusercontent.com
140.82.112.10                 codeload.github.com
52.217.223.17                 github-cloud.s3.amazonaws.com
52.217.199.41                 github-com.s3.amazonaws.com
52.217.93.164                 github-production-release-asset-2e65be.s3.amazonaws.com
52.217.174.129                github-production-user-asset-6210df.s3.amazonaws.com
52.217.129.153                github-production-repository-file-5c1aeb.s3.amazonaws.com
185.199.108.153               githubstatus.com
64.71.144.202                 github.community
23.100.27.125                 github.dev
185.199.108.133               media.githubusercontent.com
```

> 这些只能让你能够有访问 github 的能力，即 DNS 能够解析成功，但不代表无障碍访问，可能还会遇到访问失败的问题

设置脚本别名，即终端输入 `acme.sh` 执行的就是 `~/.acme.sh/acme.sh`

```bash
alias acme.sh=~/.acme.sh/acme.sh
```

这是通用的，所有主流的 Linux 都能用，Github 英文页给了支持范围。

acme 可以用命令手动更新

```bash
acme.sh --upgrade
```

也能开启自动更新（推荐）

```bash
acme.sh --upgrade --auto-upgrade
```

![命令使用及运行示例](https://static.jsonq.top/2024/10/18/160833720_bcd9c9d8-0e69-4cb1-acea-77b43fa624fc.png)

## 使用（单 DNS 运营商）

acme 是自动工作的，你签了证书之后，每 60 天就会帮你续期一次，你只要签好就行了。

- 非泛域名多域名证书如果只是想普通地签多域名证书的话，可以直接用宝塔签，宝塔也是内置的 acme 签的证书。也能自己用 acme（得自己装个新的，找到宝塔内置的 acme 在哪也行）。

```bash
acme.sh --issue -d xxx.com -d www.xxx.com --webroot /home/wwwroot/xxx.com
```

也可以这样

```bash
acme.sh --issue -d xxx.com,www.xxx.com --webroot /home/wwwroot/xxx.com
```

推荐第二种，加域名更方便。但旧版的 acme 可能不支持。

## 泛域名证书（阿里云）

由于泛域名证书需要验证域名只能用 DNS 验证而不能用文件验证，所以需要配置好相关 DNS API，目前支持近 160 种 DNS API，此处仅列举国内常用的，具体可以看 [acme.sh](https://github.com/acmesh-official/acme.sh/wiki/dnsapi) 文档。

`CloudFlare`、`DNSPod`、`GoDaddy`、`Aliyun`、`Google Cloud`

### 阿里云配置 AccessKey

![指引](https://static.jsonq.top/2024/10/18/160833988_26139db3-7694-44c1-a0ed-f81ed505ad7c.png)

自己的服务器用 AccessKey 也可以，简单方便，用子账户的话还需要手动授予权限（前提是能分辨那些该分配那些不该分配）。

![阿里云配置 Securty](https://static.jsonq.top/2024/10/18/160834234_13a64880-1051-4031-ab0e-780cdec57f0a.png)

总的配置文件是 `/root/.acme.sh/account.conf`，所有的 api 信息都最终被储存在这里。

然后打开 ssh，申请证书。

```bash
acme.sh --issue --dns dns_ali -d xxx.com,*.xxx.com --server https://acme-v02.api.letsencrypt.org/directory
```

配置正确的话，执行命令后就会自动完成证书签发续期了，生成的证书文件的路径会用绿字输出 ，每六十天会自动续期。

**注意：**新转移到阿里云或新购的域名需要转移后等一天等 DNS 全球生效之后再配置。

![输出路径](https://static.jsonq.top/2024/10/18/160834508_fb9fb3ff-8898-4918-86df-ae4aa04b27dc.png)

> 更多的域名厂商的 SSL 证书，比如 cloudflare 等生成可以参考 [DNS_API](https://github.com/acmesh-official/acme.sh/wiki/dnsapi)

## acme 命令其它使用场景

### 查看证书列表

在创建完证书后，可以使用以下命令查看证书列表。

```bash
acme.sh --list
```

### 更换服务器

当你要换服务器的时候，你只要在新的服务器装好 acme，然后把整个证书文件夹（在`/root/.acme.sh/`内，以第一个域名命名的文件夹，我这里的文件夹就是 `xxx.com_cee`）复制过去，就会在新的服务器继续自动续期。

# Nginx 配置

## 安装 Nginx

```bash
yum install nginx

# 启动
systemctl start nginx
# 开机自启
systemctl enable nginx
# 停止
systemctl stop nginx
# 重启
nginx -s reload # systemctl restart nginx
```

## Nginx 配置文件

配置 nginx

```bash
vi /etc/nginx/nginx.conf
# 或者在 /etc/nginx/conf.d 文件夹下新建 conf 文件
# nginx 识别此路径下的配置文件 /etc/nginx/conf.d/*.conf;
```

此处给出一个 nginx 配置 http 及多域名的示例，其中 `xxx.com` 就是代表你的域名

```bash
server {
    listen 80;
    server_name xxx.com www.xxx.com;
    return 301 https://$host$request_uri;
}

server {
   listen       443 ssl http2;
   listen       [::]:443 ssl http2;
   server_name  xxx.com www.xxx.com;
#    root         /usr/share/nginx/html;
   ssl_certificate "/root/.acme.sh/xxx.com_ecc/xxx.com.cer";
   ssl_certificate_key "/root/.acme.sh/xxx.com_ecc/xxx.com.key";
   ssl_session_cache shared:SSL:1m;
   ssl_session_timeout  10m;
   ssl_ciphers HIGH:!aNULL:!MD5;
   ssl_prefer_server_ciphers on;
   location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name my.xxx.com www.my.xxx.com;
    return 301 https://$host$request_uri;
}

server {
   listen       443 ssl http2;
   listen       [::]:443 ssl http2;
   server_name  my.xxx.com www.my.xxx.com;
#    root         /usr/share/nginx/html;
   ssl_certificate "/root/.acme.sh/xxx.com_ecc/xxx.com.cer";
   ssl_certificate_key "/root/.acme.sh/xxx.com_ecc/xxx.com.key";
   ssl_session_cache shared:SSL:1m;
   ssl_session_timeout  10m;
   ssl_ciphers HIGH:!aNULL:!MD5;
   ssl_prefer_server_ciphers on;

   location / {
        proxy_pass http://localhost:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> 需要先在安全组开启 80 443 端口

## 防火墙相关命令

```bash
firewall-cmd --state  # 查看防火墙状态
systemctl start firewalld.service  # 启动防火墙
systemctl stop firewalld.service  # 关闭防火墙
systemctl enable firewalld.service  # 设置开机自启动
firewall-cmd --zone=public --add-port=3306/tcp --permanent  # 开放防火墙端口 例如 3306
firewall-cmd --remove-port=3306/tcp --permanent # 删除防火墙端口
firewall-cmd --reload  # 重新加载配置
firewall-cmd --zone=public --list-ports  # 查看开放的防火墙端口
```

> 为了安全考虑，简易开启防火墙，并开放 80 443 端口，和安全组对应

## 上传证书到阿里云

先找到（搜索） 数字证书管理服务

![上传证书位置](https://static.jsonq.top/2024/10/18/160906744_82e90f2f-1341-4627-94b8-d2e5409206e3.png)

根据之前 acme 生成的证书，最简单的方法：使用 Xftp 将 `/root/.acme.sh/xxx.com_cee` 文件夹下载下到本地，然后上传到阿里云

![对应证书名](https://static.jsonq.top/2024/10/18/160926804_8ecd97db-b336-42b6-9767-f943c30f8a49.png)

> 默认情况下，Xftp 中以 `.` 开头的隐藏文件都不会显示，可以根据上方操作栏的：工具 --> 选项 --> 显示隐藏文件夹（勾选） 即可

**更新：** 脚本自动签发的证书在过期后自动签发，私钥没有更新，导致私钥重复，所以证书过期后就无法再使用此方式走泛域名证书。最稳妥的方法还是去阿里云再搞个单域名证书（3 个月免费的手动续期和 1 年 68 的手动续期），真是 mmp 了。

很奇怪，由 nginx 直接代理的 ssl 证书不受影响，https 的网站域名正常使用，但是在第三方平台上传 ssl 证书就会出现校验不通过的现象，不知怎么回事。
