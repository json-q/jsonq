---
title: 前后端分离宝塔部署
date: 2023-05-08
---

## 安装宝塔

### 连接远程服务器

通过 xshell 等远程连接工具，连接到服务器，执行以下命令：

```sh
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec
```

![xshell连接成功标识](https://jsonq.top/cdn-static/2025/02/25/1740465676590-n7tvagmx.jpg)

### 安装宝塔

1. 输入 y ，回车进行安装

![安装宝塔步骤](https://jsonq.top/cdn-static/2025/02/25/1740465676710-gugmaudz.jpg)

2. 根据需要是否配置 SSL，这里选择否(n)，等待安装

![SSL证书配置提醒](https://jsonq.top/cdn-static/2025/02/25/1740465676814-fg4z0n3d.jpg)

3. 安装完成如图所示

   **请一定要复制并保存该地址，以及账号名和密码**

![安装完成图片](https://jsonq.top/cdn-static/2025/02/25/1740465676931-k3n4i7kr.jpg)

### 开放安全组

由 **第三步** 可知，宝塔端口为在 37855，因此我们需要在服务器的安全组放行该端口，这样外网才能访问到该地址。

![放行宝塔端口](https://jsonq.top/cdn-static/2025/02/25/1740465677061-rmtz9vqy.jpg)

### 访问宝塔

![宝塔登录页面](https://jsonq.top/cdn-static/2025/02/25/1740476078938-ywosymfu.jpg)

如果操作无误，可以通过 **第三步** 提供好的地址访问成功，输入账号和密码，登录即可。

### 绑定手机号

![绑定手机号](https://jsonq.top/cdn-static/2025/02/25/1740465677160-89pg4d5x.jpg)

若无账号，访问 [宝塔官网](https://www.bt.cn/new/index.html)注册即可。

## 安装运行环境

### 安装软件

左侧菜单找到**软件商店**

搜索 MySql、Java（Java 项目一键部署）、Nginx、Redis 等等运行环境所需配置，等待安装完成。

![安装环境](https://jsonq.top/cdn-static/2025/02/25/1740465677248-62dq7h0w.jpg)

### 安装 Tomcat

spring 项目其实不需要安装 tomcat，宝塔在安装 tomcat 的时候会安装 java 环境，所以我们选择安装 tomcat8。

![tomcat安装](https://jsonq.top/cdn-static/2025/02/25/1740465677335-m7mfqi09.jpg)

## 创建数据库

密码是 root 密码，可对 root 密码进行修改。

![创建数据库](https://jsonq.top/cdn-static/2025/02/25/1740465677423-hoo3z2gh.jpg)

创建完成之后，点击**导入**，将自己开发所使用的 SQL 表导入即可。

点击右侧的**工具**课查看表结构是否导入成功。

## 前后端接口打包

### 后端打包

在入口类对应的 pom 文件中加入以下内容

```xml
    <build>
        <finalName>blog-api</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```

点击右侧 maven，依次执行 clean、（install）、package 即可。

打包成功如图所示

![打包成功截图](https://jsonq.top/cdn-static/2025/02/25/1740465677544-ah7sc4e5.jpg)

> 打包之前请将开发环境的配置，切换为服务器配置，比如连接服务器 mysql 的表名、用户名和密码等等。

### 前端打包

```bash
npm run build
```

## 上传前后端内容到服务器

### 创建项目文件夹

创建文件夹，用于存放前后端项目文件

![创建文件夹](https://jsonq.top/cdn-static/2025/02/25/1740465677672-sc2ows7p.jpg)

### 上传项目文件

进入 blog 文件夹，将后端的 jar 包和前端打包好的文件上传到此目录下

![上传前后端文件](https://jsonq.top/cdn-static/2025/02/25/1740465677815-ns5qz5p5.jpg)

## 开放运行环境安全组和防火墙端口

在访问宝塔时，开放了宝塔的端口，java 项目运行所需的端口，例如 MySQL（3306）、Redis（6379）、以及后端运行端口等等。

![开放安全组端口](https://jsonq.top/cdn-static/2025/02/25/1740465677933-bgtpdnhi.jpg)

![防火墙端口](https://jsonq.top/cdn-static/2025/02/25/1740476079160-wgfgeua8.jpg)

## 启动后端服务

### 查看与终止进程

点击左侧菜单**终端**，进入 blog 文件夹，查看当前已运行的 java 进程。

```bash
cd /www/blog  # 进入项目所在文件夹
ps -ef | grep java # 查看 java 中运行的进程PID
```

![查看进程](https://jsonq.top/cdn-static/2025/02/25/1740465678049-bk3c9hrf.jpg)

若存在其它运行的 java 进程（不包括已部署的 java 项目进程），可以将其终止，使用如下命令

```bash
kill -9 # 终止所在的进程 例如：kill -9 21097
```

### 运行 Java 项目

```bash
nohup java -jar blog-api.jar > logs.log 2>&1 &
```

> logs.log：nohup 启动的日志输出文件 nohup.out 是自动生成的，但是我们更希望自己指定日志输出文件，比如输出日志到 logs.log 文件中，logs.log 2>&1：将 2 和 1 的信息合并输出到 log.file 文件中。1 标准输出（一般是显示屏，是用户终端控制台）2 标准错误（错误信息输出）

下图中没有报错即为启动成功

![启动成功](https://jsonq.top/cdn-static/2025/02/25/1740465678194-ikpgzlsn.jpg)

**请严格检查运行日志，有时虽然运行成功，但是可能会出现端口被占用，请求时报错无法连接到数据库的问题。本地很少会出现这种情况，但在服务器可能会遇到**。

_或者先通过`java -jar blog-api.jar`直接运行查看是否有启动问题_

## 配置 Nginx

### 查看 Nginx 配置

先在终端输入以下命令

```bash
cat /www/server/nginx/conf/nginx.conf
```

![查看Nginx的配置](https://jsonq.top/cdn-static/2025/02/25/1740465678295-274t1yn9.jpg)

我们不直接写入 nginx.conf，而通过查看得知：nginx 还会读取 `/www/server/panel/vhost/nginx/*.conf`的配置，所以我们把此次的 nginx 配置写入该文件夹内部

### 新建 nignx 配置文件

由 **第一步** 得出结论，找到所在文件夹，内部新建 blog.conf 文件，并写入以下内容。

```bash
server {
                listen 3000;
                server_name ****;  # 此处填写域名或服务器ip
                charset utf-8;
                location / {
                    alias /www/blog/blog-admin/; # 前端文件所在目录
                    try_files $uri $uri/ /index.html;
                    index  index.html index.htm;
                }
                # 前端以/api开头的请求都会转发到 4000 端口上，即后端服务接口
                location /api {
                    proxy_pass http://localhost:4000/admin;
                    proxy_set_header x-forwarded-for  $remote_addr;
                }

}
```

### 重启 Nginx

```bash
cd /www/server/nginx/sbin/
./nginx -s reload
```

## 补充

### 连接远程数据库

若想要在本地使用 Navicat 等工具去连接远程服务器，经历以上步骤之后，是无法连接成功的，会显示`1045 access denied for user root...`。解决方法：

1、启动 mysql 服务（bt 可忽略，正常就是启动状态）

```bash
service mysqld status
#-mysqld is stopped 那就说明mysql服务是停止状态
#-mysqld is running 那就说明mysql服务是启动状态
```

2、登录 mysql

```bash
mysql -uroot -p*****
#mysql -uroot -p你的mysql密码，在宝塔的 数据库-->root密码 处进行查看
```

启动成功的提示和在本地登录 mysql 的提示差不多

3、切换 mysql（可忽略）

```bash
use mysql;
#Database changed  出现这个就可以了
```

**4、设置 root 的主机地址 localhost 为 %**

```bash
update user set host = '%' where user = 'root';
```

**5、刷新**

```bash
flush privileges;
```

6、查询是否已经修改到了（可忽略，此时就可以进行连接尝试）

```bash
select user,host from user;
# 输入上方命令，出现如下窗口，主要是看 root 有没有 % ，有就说明修改成功
+---------------+-----------+
| user          | host      |
+---------------+-----------+
| root          | %         |
| mysql.session | localhost |
| mysql.sys     | localhost |
+---------------+-----------+
3 rows in set (0.00 sec)
```

7、授权（给当前用户所有操作表的权限。若仅查看可忽略）

```bash
grant all privileges on *.* to 'root'@'%';
```

### 更改部署

#### 后端项目更改

根据[启动后端服务](#启动后端服务)的步骤终止将要替换的 java 项目，将原本的 jar 包 删除，替换为新的 jar 包，并重新运行。

#### 前端项目更改

替换掉前端文件夹所有内容，重启 nginx。
