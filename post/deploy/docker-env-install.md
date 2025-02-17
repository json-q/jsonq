---
title: Docker 下安装多种环境
date: 2025-01-26
---

Docker 环境搭建可参考 [docker.md](/post/deploy/docker)

# Minio

- docker pull minio/minio
- 新建 `/data/container/minio` 目录，并在 `minio` 目录下新建 `config`（配置文件映射） `db`（文件存储映射） 和 `docker-compose.yml` 文件

```yaml
name: minio
services:
  minio:
    image: minio/minio
    container_name: minio
    restart: always
    environment:
      - TZ=Asia/Shanghai
      - MINIO_ROOT_USER=jsonq
      - MINIO_ROOT_PASSWORD=180375jijao
    ports:
      - 9000:9000
      - 9999:9999
    volumes:
      - ./db:/data
      - ./config:/root/.minio
    command: minio server /data --console-address ":9999"
```

- 启动容器 `docker compose up -d`
- 可以运行 `docker compose logs -f` 查看运行日志

> 由于有网络桥接，在每次启动容器时，先 `systemctl restrat docker` 重启 docker 服务。

此时可以访问 `http://ip:9999`，前提是安全组和防火墙放行 `9999` 端口

# Nginx

- docker pull nginx

新建 `/data/container/nginx` 文件夹，并在 `nginx` 目录下新建 `docker-compose.yml` 文件，写入以下内容

```yaml
services:
  nginx:
    image: nginx
    container_name: nginx
    restart: always
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./html:/usr/share/nginx/html
      - ./logs:/var/log/nginx
      # - ./nginx.conf:/etc/nginx/nginx.conf  # dcoker 不支持文件挂载
      - ./conf.d:/etc/nginx/conf.d # conf.d 下的 *.conf 会被识别成 nginx 配置文件
      - ./default.d:/etc/nginx/default.d
    environment:
      - TZ=Asia/Shanghai
    privileged: true # 解决nginx的文件调用的权限问题
```

dcoker 只支持挂载文件夹，所以 `/etc/nginx/nginx.conf` 无法映射本地目录，会报错，需要提前拷贝出来

```bash
docker cp 容器id或名称:/etc/nginx/nginx.conf ./nginx.conf
```

docker 默认安装的 nginx 是没有配置 80 服务的，所以我们需要去 `default.d` 文件夹下新建 `xxx.conf` 文件，这个 xxx 随便什么名字都行

```bash
server {
    listen 80;
    server_name localhost;

    location / {
        # 注意，这里必须是容器的目录地址，而非宿主机的本地目录
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

由于我们将本地的 `./html` 和容器的 `/usr/share/nginx/html` 做映射，所以直接在 `html` 文件夹下新建 `index.html`，写入点东西，保存，`docker restart 容器id或名字`，访问 ip 地址即可看到 html 内容。

# acme

- docker pull neilpang/acme.sh
- cd /data/container && mkdir acme

新建 `docker-compose.yml`，去阿里云申请一个子账户，勾选权限策略 `AliyunDNSFullAccess - 管理云解析（DNS）的权限`，会生成 `id` 和 `Secret`,**一定要保存好，仅有一次查看机会**

```yaml
services:
  acme-sh:
    image: neilpang/acme.sh
    container_name: acme
    restart: always
    command: daemon
    environment:
      - Ali_Key="你的 AccessKeyId"
      - Ali_Secret="你的 AccessKeySecret"
    volumes:
      - ./acme:/acme.sh
    network_mode: host
```

- 需要注册邮箱: `docker exec acme --register-account -m ccc@xx.xxx`
- 注册证书: `docker exec acme --issue --dns dns_ali -d jsonq.top -d *.jsonq.top`
  - 如果网络执行较慢，第二步可以添加 `--server https://acme-v02.api.letsencrypt.org/directory`

执行成功后，会显示证书的路径，如下所示

```bash
[Sun Jan 26 06:27:52 UTC 2025] Your cert is in: /acme.sh/jsonq.top_ecc/jsonq.top.cer
[Sun Jan 26 06:27:52 UTC 2025] Your cert key is in: /acme.sh/jsonq.top_ecc/jsonq.top.key
[Sun Jan 26 06:27:52 UTC 2025] The intermediate CA cert is in: /acme.sh/jsonq.top_ecc/ca.cer
[Sun Jan 26 06:27:52 UTC 2025] And the full-chain cert is in: /acme.sh/jsonq.top_ecc/fullchain.cer
```

如果没成功，建议删除镜像重新拉取执行命令

## 注意事项

不同的运营商的 `DNS API` 不一样，这里使用 阿里云，则是 `dns_ali`，如果是其它运营商，请参考 [How to use DNS API](https://github.com/acmesh-official/acme.sh/wiki/dnsapi)

- `*.jsonq.top` 这里的 `*` 就代表泛域名

执行完毕命令之后，就可以看到在 acme 目录下，将容器的 `acme.sh` 文件内容全都映射出来了

## 定时任务更新证书

安装自动更新脚本

```bash
docker exec acme --upgrade --auto-upgrade
```

在 docker 宿主机添加一条定时任务，让 acme 去检查证书是否过期，即将过期是就会执行脚本自动更新

```bash
crontab -e

# 添加以下定时任务
10 0 * * * docker exec acme --cron >> /data/container/acme/acme_cron.log 2>&1
10 1 * * * docker restart nginx
```

然后 `:wq` 保存退出

使用 `crontab -l` 查看定时任务是否添加成功

## 修改 nginx

在 nginx 的 `docker-compose.yml` 中添加如下内容

```yaml
services:
  nginx:
    volumes:
      - /data/container/acme/acme:/etc/nginx/ssl
```

然后停止 nginx 容器，重新启动，**注意，由于更改是 docker compose，所以必须停止，然后再使用 docker compose up -d 启动**

## 修改 nginx 配置文件

```bash
server {
    listen 80;
    server_name jsonq.top www.jsonq.top;
    return 301 https://$host$request_uri;
}

server {
   listen       443 ssl http2;
   listen       [::]:443 ssl http2;
   server_name  xxx.com www.xxx.com;
  #  root         /usr/share/nginx/html;
   ssl_certificate "/etc/nginx/ssl/jsonq.top_ecc/jsonq.top.cer";
   ssl_certificate_key "/etc/nginx/ssl/jsonq.top_ecc/jsonq.top.key";
   ssl_session_cache shared:SSL:1m;
   ssl_session_timeout  10m;
   ssl_ciphers HIGH:!aNULL:!MD5;
   ssl_prefer_server_ciphers on;
   location / {
       root /usr/share/nginx/html;
       try_files $uri $uri/ /index.html;
       index  index.html index.htm;
   }
}
```

重启 nginx 容器：`docker restart nginx`

此时访问 `jsonq.top` 应该就可以了，如果还是报不安全，建议去运营商的 ssl 管理后台去上传证书，这里以阿里云为例

- 证书文件 - `jsonq.top.cer`
- 证书私钥 - `jsonq.top.key`
- 证书链 - `ca.cer`

# nginx 和 minio 网络桥接

现在 minio 的容器和 nginx 的容器是互不干涉的，但是我有域名之后，想让 nginx 的域名代理到 minio。所以需要将两个容器的网络桥接起来，让两个容器共享网络

创建自定义网络桥接

```bash
docker network create nginx-minio-network
```

查看现有的网络桥接列表

```bash
docker network ls
```

删除 `docker network rm xxx`

minio 的 `docker-compose.yml`

```yaml
name: 'minio'
services:
  minio:
    networks:
      - nginx-minio-network
networks:
  nginx-minio-network:
    external: true
```

nginx 的 `docker-compose.yml`

```yaml
services:
  nginx:
    networks:
      - nginx-minio-network
networks:
  nginx-minio-network:
    external: true
```

修改 nginx 的配置文件

```bash
server {
    listen 80;
    server_name minio.jsonq.top www.minio.jsonq.top;
    return 301 https://$host$request_uri;
}

server {
   listen       443 ssl http2;
   listen       [::]:443 ssl http2;
   server_name  minio.jsonq.top www.minio.jsonq.top;
   ssl_certificate "/etc/nginx/ssl/jsonq.top_ecc/jsonq.top.cer";
   ssl_certificate_key "/etc/nginx/ssl/jsonq.top_ecc/jsonq.top.key";
   ssl_session_cache shared:SSL:1m;
   ssl_session_timeout  10m;
   ssl_ciphers HIGH:!aNULL:!MD5;
   ssl_prefer_server_ciphers on;
   location / {
        proxy_pass http://minio:9999;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

# Nextjs

Nextjs 部署就不能直接像单页一样打个 dist 包扔服务器上了，整体流程就是根据像代码先**构建镜像**，就类似于 `docker pull` 拉取镜像一样，创建一个镜像，然后**运行容器**。

## .dockerignore

```txt
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git
```

## 编写 Dockerfile 构建镜像

```yml
# 指定基础镜像版本，确保每次构建都是幂等的
FROM node:20-alpine AS base

FROM base AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Node v16.13 开始支持 corepack 用于管理第三方包管理器
# 锁定包管理器版本，确保 CI 每次构建都是幂等的
# RUN corepack enable && corepack prepare pnpm@latest --activate
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

WORKDIR /app

# pnpm fetch does require only lockfile
# 注意还需要复制 `.npmrc`，因为里面可能包含 npm registry 等配置，下载依赖需要用到
COPY pnpm-lock.yaml ./
COPY patches ./patches

# 推荐使用 pnpm fetch 命令下载依赖到 virtual store，专为 docker 构建优化
# 参考：https://pnpm.io/cli/fetch
RUN pnpm fetch

# 将本地文件复制到构建上下文
COPY . .

# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# 基于 virtual store 生成 node_modules && 打包构建
# 此处不需要与 package registry 进行通信，因此依赖安装速度极快
# 注意 PNPM v8.4.0 版本有一个 breaking change
# 当 `node_modules` 存在，运行 `pnpm install` 会出现命令行交互操作，导致 CI 挂掉
# 这里加上 `--force` 参数，关闭命令行交互操作
RUN pnpm install --offline --force && pnpm build

FROM base AS runner

# RUN apk update && apk add --no-cache git
RUN apk add --no-cache curl

# 如果需要是用 TZ 环境变量 实现时区控制，需要安装 tzdata 这个包
# debian 的基础镜像默认情况下已经安装了 tzdata，而 ubuntu 并没有
# RUN apk add --no-cache tzdata

ARG RUNTIME_ENV
ENV RUNTIME_ENV=$RUNTIME_ENV
ENV NODE_ENV production

# Docker 容器不推荐用 root 身份运行
# 这边先建立一个特定的用户和用户组，为它分配必要的权限，使用 USER 切换到这个用户
# 注意，如果不是 root 权限，对于可执行文件，需要修改权限，确保文件可以执行
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置时区
# 在使用 Docker 容器时，系统默认的时区就是 UTC 时间（0 时区），和我们实际需要的北京时间相差八个小时
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8 TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# PNPM 有一个全局 store，项目中的 node_modules 实际上是全局 store 的 symlink
# 正常需要从上一阶段同时复制 `node_modules` 和全局 store，这样才能正常运行
# 但是由于 `standalone` 目录里面包含所有运行时依赖，且都是独立目录
# 因此可以直接复制该目录，无需复制全局 store（如果复制还会增加镜像体积）
# 另外运行需要的配置文件、dotfile 也都在 `standalone` 目录里面，无需单独复制

# `standalone` 模式打包，默认包含服务端代码，没有客户端代码
# 因为官方建议通过 CDN 托管，但也可以手动复制 `public`、`.next/static` 目录
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 注意，`standalone` 目录下已经包含了服务端代码，无需再复制 `.next/server`
# COPY --from=builder /app/.next/server ./.next/server

USER nextjs

# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# 默认暴露 80 端口
EXPOSE 3000

# 用 standalone 模式打包后，生成的 `standalone/node_modules` 目录下缺少 `.bin` 目录
# 导致无法用 `next` 命令启动项目，但可以用 `node server.js` 启动
# 参考：https://nextjs.org/docs/advanced-features/output-file-tracing
CMD ["node", "server.js"]
```

Dockerfile 注意事项： **执行 COPY 命令时，COPY 的文件必须存在，否则 COPY 失败会导致镜像构建失败**

> 使用 `docker build -t nextjs .` 来构建镜像，其中 `nextjs` 就是镜像名，名字随便起，只要使用镜像时使用这个镜像名即可

## 编写 docker-compose 启动容器

```yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: nextjs # docker build -t nextjs .
    container_name: blog
    ports:
      - 3000:3000
    networks:
      - nginx-minio-network

networks:
  nginx-minio-network:
    external: true
```

- `nginx-minio-network` 就是自定义的网络桥接，由于 Nextjs 项目要通过 Nginx 代理，所以必须处于同一个网络桥段下，才能让各容器共享一个网络
- `image: nextjs` 这里指定了刚才构建的镜像 `nextjs` 镜像，如果不指定，执行 `docker compose up -d` 时，Nextjs 会自动再依据 `Dockerfile` 重新构建一个镜像
- `container_name: blog` 指定容器别名，nginx 代理时可以直接 `http://blog:3000` 即可代理到该容器的运行地址

## 配置 Nginx 代理

```bash
server {
    listen 80;
    server_name jsonq.top www.jsonq.top;
    return 301 https://$host$request_uri;
}

server {
   listen       443 ssl http2;
   listen       [::]:443 ssl http2;
   server_name  jsonq.top www.jsonq.top;
#    root         /usr/share/nginx/html;
   ssl_certificate "/etc/nginx/ssl/jsonq.top_ecc/jsonq.top.cer";
   ssl_certificate_key "/etc/nginx/ssl/jsonq.top_ecc/jsonq.top.key";
   ssl_session_cache shared:SSL:1m;
   ssl_session_timeout  10m;
   ssl_ciphers HIGH:!aNULL:!MD5;
   ssl_prefer_server_ciphers on;
   location / {
     #  root /usr/share/nginx/html;
     #  try_files $uri $uri/ /index.html;
     #  index  index.html index.htm;
        proxy_pass http://blog:3000;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   }
}
```

配置完之后，直接重启 nginx 容器即可。
