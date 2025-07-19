---
title: Docker 学习
date: 2024-11-02
---

## 服务器安装 Docker

参考地址: https://docs.docker.com/engine/install/centos/

1. 进入终端，执行如下命令删除系统中的旧版本 docker：

```bash
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

2. 设置 docker 镜像源（阿里镜像源）

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

3. 安装 docker 引擎

```bash
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

- docker-ce Docker: 引擎
- docker-ce-cli: Docker CLI 命令
- containerd.io: 容器运行时环境
- docker-buildx-plugin: 构建镜像的插件工具
- docker-compose-plugin: Docker Compose 批量构建工具

> 输入两次 y 确认即可等待安装成功

## Docker 启动配置

1. 启动 docker

```bash
sudo systemctl start docker
```

2. 检查 docker 是否启动成功，随便运行一个 docker 命令

```bash
# 检查 docker 启动的进程
docker ps
```

3. 设置 docker 启动自启

```bash
sudo systemctl enable docker
```

4. 设置加速（默认 docker 下载镜像是从 docker hub 下载，设置镜像源）

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://hub.rat.dev",
    "https://docker.wanpeng.top",
    "https://doublezonline.cloud",
    "https://docker.mrxn.net",
    "https://lynn520.xyz",
    "https://ginger20240704.asia",
    "https://docker.wget.at",
    "https://dislabaiot.xyz",
    "https://dockerpull.com",
    "https://docker.fxxk.dedyn.io",
    "https://dhub.kubesre.xyz",
    "https://atomhub.openatom.cn",
    "https://docker.m.daocloud.io",
    "https://docker.udayun.com",
    "https://docker.211678.top",
    "https://docker.nju.edu.cn",
    "https://mirror.iscas.ac.cn",
    "https://docker.xuanyuan.me",
    "https://docker.1ms.run"
  ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 镜像操作（下载镜像）

- `docker search <name>` : 搜索（docker hub）镜像
- `docker pull <name>` : 拉取（docker hub）镜像
- `docker images` : 查看已下载镜像
- `docker rmi <name>` : 删除已有镜像

以 nginx 为例

```bash
docker search nginx
docker pull nginx
docker images
docker rmi nginx
```

pull 镜像，以 hub.uuuadc.top 为例

```bash
docker pull hub.uuuadc.top/library/mysql:5.7
```

> 说明：library 是一个特殊的命名空间，它代表的是官方镜像。如果是某个用户的镜像就把 library 替换为镜像的用户名。

## 容器操作命令（启动容器）

- docker run : 运行镜像
- docker ps : 查看运行中的容器
- docker ps -a : 查看所有容器（包括已停止的）
- docker stop : 停止容器
- docker start : 启动容器
- docker restart : 重启容器
- docker status : 查看容器状态
- docker logs : 查看容器日志
- docker exec: 进入容器
- docker rm : 删除容器
- dokcer rmi : 删除镜像

其中 `docker run` 和 `docker exec` 相对操作较为复杂，详细命令使用 `docker run --help` 查看

以 `docker run` 为例，命令格式为 `docker run [OPTIONS] IMAGE [COMMAND] [ARG...]`，其中 `[OPTIONS]` 就是通过 `--help` 查看到的可选参数项，`IMAGE` 为容器名称，后边两个若不更改容器默认启动行为，则无需关心。

> 操作容器的那几个命令，都是以 `<容器 id | 容器名称>` 运行的，比如 `docker stop 896`（根据容器 id 停止容器） 或者 `docker stop quizzical_hertz`（根据容器运行名称停止容器）

### docker run 启动容器

> 仅了解，正式启动容器需查看 [docker-run 详细使用](#docker-run-详细使用)

一般情况下，只需要执行 `docker run <image>` 即可启动容器。如果没有该容器，则会自动下载。但是此方式只要停止命令（crtl + c）。

此时通过 `docker ps` 可查看相关的容器启动信息，`docker ps -a` 可查看所有容器包括已停止的。

- 若要启动一个已停止的容器，使用 `docker start <容器id | 容器别名>`。
- 容器 id 可只写 3 位，只要能和其它容器 id 区分即可。
- 默认不指定容器名称情况下，会随机生成

### 删除容器

`docker rm <容器id | 容器名称>`，执行该命令时，该容器必须是停止状态。如果想要强制删除容器，可以使用 `docker rm -f <容器id | 容器名称>`。

### docker run 详细使用

启动容器时，目前有两种方式：

- `docker run` 启动
  - 会阻塞控制台，crtl + c 会直接停掉容器，此时还需要 `docker start` 启动并挂起容器
- `docker start` 启动
  - 每次启动都会生成新的容器 id
  - 比如 `nginx` 启动，虽然通过 `docker ps` 可以查看到占用 80 端口，但此时访问 ip 是打不开的

> 以上简单命令，无法满足正常的容器管理

#### 后台启动

例如 `docker run -d --name mynginx nginx`

- `-d` 后台运行
- `--name` 指定容器名称，不指定则系统随机分配一个名称

#### 容器外部访问

以 nginx 为例，当使用 `docker run` 启动 nginx 后，通过 80 端口依然无法在外网访问。

那是因为 nginx 容器只在当前 docker 镜像内运行，而非服务器环境运行。（可以把服务器当作最大的盒子，内部的 docker 环境看作小盒子，且小盒子之间是互相隔离的），访问外网 80 是访问的主机 80，而非 docker 镜像内 nginx 容器的 80。

> 想实现主机端口到镜像端口，需要做**端口映射**，例如 `-p 88:80`，意思就是当访问主机的 88 端口，就相当于访问容器的 80 端口。

所以实现一个比较规范的容器启动命令，例如：`docker -d --name mynginx -p 88:80 nginx`

> **想要主机能够访问到容器，一定要为容器暴漏端口**。（容器端口可以重复，主机端口不能重复，因为每一个容器都可以当作一个虚拟机，容器之间互相隔离，所以端口可以相同，因为互不影响）

### 进入容器

以 nginx 为例，`docker exec -it <容器id | 容器名称> bash` 即可进入 nginx 容器

进入之后，`ls /` 查看可知，容器内容就是一个小型的 linux 环境，就可以像正常操作 linux 一样操作容器了。退出容器时，使用 `exit` 即可。

### 保存容器（加载容器）

- docker commit : 提交镜像，将当前修改后的镜像提交
- docker save : 将镜像保存为 tar 文件
- docker load : 从 tar 文件加载镜像

1. docker commit

例如 `docker commit -m "commit message" mynginx mynginx:v1.0`，`mynginx` 就是 `docker run` 启动的容器名称，`mynginx:v1.0` 就是镜像名称，然后可以用 `docker images` 查看，此时会多出来一个镜像 `mynginx:v1.0`。

具体命令可使用 `docker commit --help` 查看。

2. docker save

例如 `docker save -o mynginx.tar mynginx:v1.0` ，将已创建的镜像 `mynginx:v1.0` 打成一个 `tar` 包，然后 `ls` 可以查看多出来一个 `mynginx.tar` 文件。

3. docker load

例如 `docker load -i mynginx.tar`，将之前保存的镜像包 `mynginx.tar` 加载到本地，此时 `docker images` 可以看到多了一个镜像 `mynginx:v1.0`。然后就可以使用 `docker run` 启动容器了。

这一步和 `docker pull` 下载镜像差不多，区别就是从社区下载和本地加载。

## 镜像存储（目录挂载）

每次删除镜像再运行镜像，都会重新下载镜像，可以把镜像某些数据保存下来，方便下次使用。

所谓目录挂载，就是**把容器的文件夹挂载到主机的某个文件夹**，两边文件互相影响（双向绑定），但是删除容器，不会导致主机文件被删除。

- `-d` 后台启动
- `-p 80:80` 主机 80 映射到容器 80
- `-v /data/nginx/html:/usr/share/nginx/html` 将主机的 /data/nginx/html 挂载到容器的 /usr/share/nginx/html
- `--name mynginx` 镜像名称

```bash
docker run -d -p 80:80 -v /data/nginx/html:/usr/share/nginx/html --name mynginx nginx
```

## 卷映射

卷映射和目录映射类似，但是卷映射是 docker 内部创建的，而目录映射是主机创建的。

- 目录映射
  - 在主机中创建文件，挂载到容器中，两边双向影响，属于外挂载。
  - 例如 `-v /data/nginx/html:/usr/share/nginx/html` 就是主机的 `/data/nginx/html` 文件夹挂载到容器的 `/usr/share/nginx/html` 文件夹上。
  - 场景缺点：比如 `nginx.conf`提到主机中文件名 `ngconf`，如果作为每个 nginx 容器的配置文件，在 `docker run` 时会报错找不到配置文件。原因是：主机先创建 `ngconf`，挂载到 nginx 处，由于先创建了个空文件，导致 nginx 容器无法启动，自然无法同步 nginx 本身的配置文件。
- 卷映射
  - 将容器中的文件内部映射到了主机的某个地方，所有容器的内映射都统一存在主机的 `/var/lib/docker/volumes<volume_name>` 目录下
- 两种方式，在主机挂载/映射的文件，在容器删除时，都依然保留主机上的映射文件。

> 卷名的存储目录若无法记住，可以直接使用 `docker volume inspect <volume_name>` 查看卷的存储位置就可以了
