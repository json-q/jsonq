---
title: Centos7 离线部署 SpringBoot 前后端分离项目
date: 2023-07-13
---

- 本文介绍了在内网下的**纯离线环境**中部署 SpringBoot 前后端分离项目，服务器使用的是 `centos7` 版本
- 由于离线环境，`yum` 和 `wget` 这种直接下载的是无法使用的，需要自己找离线资源包。
- 此前并未接触过 linux，仅仅需要才使用，因此对部分理解不一定非常准确，望谅解。
- 此文章中涉及到的安装包已提供**百度网盘链接**：https://pan.baidu.com/s/196D7sk4HFTC61yWY8ZNwJQ?pwd=ngnl

# 工具选择

选择合适的工具进行远程连接，如 Xshell、Xftp、putty、Terminus 等

- Xshell：连接远程服务器的命令终端
- Xftp：连接远程服务器的资源，以 windows 文件夹的形式呈现

查看系统版本，下载的离线包版本应和 linux 系统版本一致

```bash
cd /  # 进入文件主目录，所有的文件资源都在主目录下
cat /proc/version  # 查看系统版本
```

![系统版本](https://jsonq.top/cdn-static/2025/02/25/1740465678972-gs6mcduk.jpg)

> 首次进入的当前路径都是 /root，可以使用命令： pwd 查看当前所在路径所有的资源文件都在 / 路径下

# JAVA 环境搭建安装

## 下载 JDK

进入 JDK 官网，下载与**开发所需的系统版本对应的压缩包类型**：https://www.oracle.com/java/technologies/downloads/#java17

![下载 JDK17](https://jsonq.top/cdn-static/2025/02/25/1740465679061-s0enuhiu.jpg)

- `.tar.gz` 类似 windows 的 压缩包
- `.rpm` 解压出来的文件是类似 exe 默认安装即可使用的 rpm 文件

> 选择 `x64` 版本就是为了和 linux 的系统版本对应

## 检查残留 JDK

查看有关 java 的相关文件

```bash
rpm -qa | grep java
```

如果显示有相关文件，则执行如下命令删除，无任何文件输出则忽略

```bash
rpm -qa | grep java |xargs rpm -e --nodeps
```

查看系统是否还存在 java 环境，未输出 java 相关版本即可。

```bash
java -version
```

## 上传 JDK

新建一个专门用来存放上传文件的文件夹。_当前处于 `/` 路径下_

```bash
mkdir -p data/software  # 创建嵌套文件夹 /data/software
```

- **上传方法一**：使用 Xftp 将下载的 jdk 压缩包上传至 `software` 文件夹下
- **上传方法二**：使用命令将本地文件上传至 linux 服务器上
  - 进入上传文件所在的目录执行 cmd 命令，例如上传 test 文件夹。_（上传的文件必须在本机，外部 U 盘等文件无法识别）_

```bash
# root：远程服务器登录名；10.xx.xx.xxx：服务器地址；/data/software：上传到服务器的指定路径下
scp test root@10.xx.xx.xxx:/data/software
# 输入 yes。输入远程服务器登录密码。
```

> 如果服务器系统进行了重装，再次连接需清除本地的关于远程服务器的缓存和公钥信息，执行命令：`ssh-keygen -R 10.xx.xx.xxx`

## 安装 JDK

进入上传 jdk 的文件夹并解压，最后对解压出来的文件夹重命名

```bash
cd /data/software  # 进入文件夹
ls  # 查看当前目录的所有文件
tar -zxvf jdk-17_linux-x64_bin.tar.gz # 解压
mv jdk-17.0.8 jdk17  # 重命名为 jdk17
```

> 默认解压到当前文件夹下，若需要指定解压路径，则可以输入 `tar -zxvf jdk-xxx -C /xxx/xxx/`

### 配置环境变量

编辑 profile 文件。`/etc/profile` 的 profile 文件内部相当于 windows 的环境变量  
也可以使用 Xftp 直接找到该文件进行编辑修改

```bash
vi /etc/profile
```

在文件最下方添加 jdk 的环境配置。如何添加参考下一小节路径存储路径不同时，只需更改 `JAVA_HOME` 的路径即可。

```bash
# jdk config
export JAVA_HOME=/data/software/jdk17
export JRE_HOME=$JAVA_HOME/jre
export CLASSPATH=$CLASSPATH:$JAVA_HOME/lib:$JRE_HOME/lib
export PATH=$PATH:$JAVA_HOME/bin:$JRE_HOME/bin
```

执行命令使修改立即生效

```bash
source /etc/profile
java -version # 查看 jdk 环境是否安装成功
```

出现 jdk 的版本号等内容，即安装成功

![jdk 版本](https://jsonq.top/cdn-static/2025/02/25/1740465679172-lnz0wsr4.jpg)

### vi 编辑内容使用方式

- 按 `insert` 键进入编辑模式，通过箭头移动编辑位置，在内容最后添加配置
- 写完后,点击 `esc` 按钮退出编辑模式,用命令 `:wq!` 保存退出
- `:q!` ：不保存退出
- `:w` ：保存文件
- `:wq` ：保存修改后退出编辑器
- `:e!` ：撤销修改

# Mysql 环境搭建安装

## 删除残留 Mysql 和 Mariadb

### 删除残留 Mysql

- 删除数据库残留文件

```bash
rpm -qa | grep -i mysql  # 查找数据库残留文件

# 卸载数据库安装文件，将刚刚查找到的 mysql 都卸载
rpm -ev --nodeps mysql-community-client-plugins-8.0.33-1.el7.x86_64
# .....
```

![删除数据库安装文件](https://jsonq.top/cdn-static/2025/02/25/1740465679262-rd1xl8uk.jpg)

- 删除数据库相关的文件

```bash
find / -name mysql  # 查找数据库相关的文件
rm -rf /var/lib/mysql  # 依次将查找的文件删除
# ...
```

![image](https://jsonq.top/cdn-static/2025/02/25/1740465679365-mcggwd3c.jpg)

### 删除自带的 Mariadb

Centos7 默认安装的是 Mariadb 数据库，Mariadb 保留了和 MySQL 一模一样的配置，所以安装 MySQL 时可能会和 Mariadb 产生冲突，此时就要卸载自带的 Mariadb

```bash
## 查看自带的Mariadb
rpm -qa | grep mariadb        # or： yum list installed | grep mariadb
## 卸载
rpm -e --nodeps mariadb-xxx  # or： yum -y remove mariadb-xxx
```

检查 `etc/my.cnf` 文件是否存在，存在就删除掉

```bash
find /etc -name "my.cnf"
rm -rf /etc/my.cnf  # 若有路径输出，则执行删除命令
```

## 下载上传 Mysql

进入 Mysql 下载网址：https://dev.mysql.com/downloads/mysql/

![tar.xz压缩包](https://jsonq.top/cdn-static/2025/02/25/1740465679480-6pvnsw80.jpg)

通过输入：`rpm -qa | grep glibc`，可查看当前 linux 系统内置的 `glibc` 版本

![image](https://jsonq.top/cdn-static/2025/02/25/1740465679604-4xztgk91.jpg)

下载对应版本完成之后上传 Mysql 至 `data/software` 路径下并解压

```bash
# tar.xz 正常需解压两次：xz -d mysql-xx 解压出 tar 压缩包；再次 tar -xvf mysql-xx 解压出 mysql 文件夹
tar xvJf mysql-8.0.34-linux-glibc2.12-x86_64.tar.xz  # xvJf 属于以上两命令的合并
mv mysql-8.0.34-linux-glibc2.12-x86_64 mysql  # 重命名为 mysql
```

## 配置 Mysql 环境

### 初始化数据库

```bash
useradd mysql  # 添加 mysql 用户
cd mysql  # 在 mysql 目录下创建存储数据表的文件夹 data
mkdir data
cd bin  # 进入 mysql 文件 的 bin 目录下
# 初始化mysql
./mysqld --initialize --user=mysql --datadir=/data/software/mysql/data --basedir=/data/software/mysql
```

- 如果初始化时出现如下错误（libaio 缺失）

![libaio 缺失](https://jsonq.top/cdn-static/2025/02/25/1740465679702-eayvnp4l.jpg)

- 下载 `libaio` 的 rpm 文件：点击 [链接](http://mirror.centos.org/centos/7/os/x86_64/Packages/libaio-0.3.109-13.el7.x86_64.rpm) 直接下载 `liabio` 的 `x86_64` 位 rpm 包
- 上传到服务器并进入所在文件夹安装该 rpm：`rpm -ivf libaio-0.3.109-13.el7.x86_64.rpm`
- 再次执行初始化 Mysql 的命令，出现类似如下内容即成功

![mysql 初始化完成](https://jsonq.top/cdn-static/2025/02/25/1740465679794-1lqmiilk.jpg)

> **一定要保存 mysql 的临时登录密码** 系统所缺失的文件大部分都可以从该网站上搜索下载对应的 rpm 文件：https://pkgs.org

## 启动数据库服务

```bash
./mysqld_safe&  # 启动临时服务 进入 mysql bin 目录下执行
# 登录数据库 在 bin 目录下执行
./mysql -uroot -p # 输入 mysql 初始密码进入 mysql

show databases;  # 执行 sql 正常会报错，需要修改 Mysql 密码
```

如图所示：

![Mysql 服务启动](https://jsonq.top/cdn-static/2025/02/25/1740465679901-k3wisa8u.jpg)

> 此方式启动的 Mysql 服务为**临时服务**，回车就会结束该进程，所以在未进入 Mysql 时不能 `ctrl+c` 或者 `enter`

### 修改 Mysql 初始密码

执行 `show databases;` 时出现如下错误，意思是必须先修改 mysql 密码

![修改 mysql 密码](https://jsonq.top/cdn-static/2025/02/25/1740465680037-gqg7gs9f.jpg)

- 修改 mysql 密码

```bash
alter user 'root'@'localhost'  identified by 'Root123..';
# 执行 quit 或者 exit 退出 mysql，重新进入输入的密码就是修改后的密码
```

### 添加环境配置

<span style={{color:"red"}}>在配置环境变量之前，使用 `systemctl status mysqld` 之类的命令，系统是无法识别到的</span>

- 在 etc 目录下新增 mysql 配置文件 `my.cnf`

```bash
touch /etc/my.cnf  # 创建 my.cnf 文件
vi /etc/my.cnf  # 编辑该文件，将配置代码粘贴进去保存
```

```bash
[mysqld]
# 指定 mysql 的路径
socket =/data/software/mysql/mysql.sock
basedir=/data/software/mysql
datadir=/data/software/mysql/data

[client]
socket =/data/software/mysql/mysql.sock
```

- 配置 Mysql 环境变量

```bash
vi /etc/profile

# 添加两行内容
export MYSQL_HOME=/data/software/mysql
export PATH=$PATH:$MYSQL_HOME/bin
# 如果已有多个环境变量，PATH 的配置使用以下命令，环境变量之间用 : 区分
export PATH=$PATH:已有的环境变量xxxxx:$MYSQL_HOME/bin

# 退出刷新环境变量
source /etc/profile
```

如图所示：

![配置 Mysql 环境变量](https://jsonq.top/cdn-static/2025/02/25/1740465680160-r397s6h4.jpg)

### 设置 Mysql 服务

- 设置 Mysql 服务运行文件

```bash
# 将服务文件 copy 至 etc/init.d 中，并重命名为 mysql 或者 mysqld
cp /data/software/mysql/support-files/mysql.server /etc/init.d/mysqld
# 对文件赋予执行权限
chmod 777 /etc/init.d/mysqld
# 增加 mysql 服务
chkconfig --add mysqld
# 查询 mysql 服务
chkconfig --list mysqld
# mysql           0:off 1:off 2:on 3:on 4:on 5:on 6:off
# 默认运行级别为 2 3 4 5 为 on，如果 3 4 5 为 off，则执行命令
chkconfig --level 345 mysqld on
```

此时可以选择查看 Mysql 的状态和控制启动

```bash
systemctl start mysqld  # 启动 mysql 服务
systemctl status mysqld  # 查询 mysql 运行状态
```

- 检查 mysql 配置

```bash
mysql -V  # 查看 mysql 版本
```

此时应该是报找不到 mysql 的错误。原因是：系统默认会查找 `/usr/bin` 下的命令（大概），mysql 没有在这个目录下

- 设置 Mysql 路径映射

linux 中的软连接类似于在 windows 下，在另一个文件做一个该文件的 快捷方式

```bash
# ln -s 源文件地址 目标文件
ln -s /data/software/mysql/bin/mysql /usr/bin
```

启动 Mysql 服务如图所示：

![启动 Mysql 服务](https://jsonq.top/cdn-static/2025/02/25/1740465680248-64s6g8en.jpg)

> 将 Mysql 的服务文件地址映射到 `/usr/bin` 的原因是：之前从 Mysql 拷贝到 `/etc/init.d/mysqld` 的服务进程文件默认读取的是 `/usr/bin/mysql` 的路径

## 连接远程数据库

**开放项目运行所需端口，常见 80、Mysql：3306、后端程序运行端口等，并重启防火墙**

防火墙常用命令

```bash
firewall-cmd --state  # 查看防火墙状态
systemctl start firewalld.service  # 启动防火墙
systemctl stop firewalld.service  # 关闭防火墙
systemctl enable firewalld.service  # 设置开机自启动
firewall-cmd --zone=public --add-port=3306/tcp --permanent  # 开放防火墙端口
firewall-cmd --remove-port=3306/tcp --permanent # 删除防火墙端口
firewall-cmd --reload  # 重新加载配置
firewall-cmd --zone=public --list-ports  # 查看开放的防火墙端口
```

**做完如上部署，重新登录进到数据库，修改 user 表中的 Host**

```bash
# mysql -uroot -p123456                     # 登录数据库
show databases;                             # 查看数据库
use mysql;                                  # 使用mysql
select Host, User from user;                # 查询表
update user set Host='%' where User='root'; # 修改User表内root用户的Host为%
flush privileges;                           # 刷新
```

> 此时即可使用本地 Navicat 尝试连接

<span style={{color:"red"}}>如果做 **nginx 本地资源映射**的话，例如 3306 这些可以外部访问/连接的端口。为了安全起见，可以在数据初始化之后关闭对应的安全组，非必要情况下，可以只开放 80 或者 443 安全组端口</span>

如果需要再次修改密码

```bash
# 之前修改root 中的 host 是'%'
alter user 'root'@'%' identified with mysql_native_password by 'xxx';
```

# Nginx 环境搭建安装

**检查是否有 Nginx**

```bash
whereis nginx
rm -rf ngin-xxxx  # 若有文件输出，则执行删除命令
```

## 下载 Nginx 及依赖

### 安装 Nginx 所需依赖

#### 安装 gcc 和 gcc-c++

下载如下依赖并上传服务器：下载地址（阿里云镜像）：http://mirrors.aliyun.com/centos/7/os/x86_64/Packages/

安装的内容较多，可以单独建个文件夹存放，安装完的即可删除。

- gcc 依赖清单
  - cpp-4.8.5-44.el7.x86_64.rpm
  - gcc-4.8.5-44.el7.x86_64.rpm
  - glibc-devel-2.17-317.el7.x86_64.rpm
  - glibc-headers-2.17-317.el7.x86_64.rpm
  - kernel-headers-3.10.0-1160.el7.x86_64.rpm
  - libmpc-1.0.1-3.el7.x86_64.rpm
  - mpfr-3.1.1-4.el7.x86_64.rpm
- gcc-c++ 依赖清单
  - gcc-c++-4.8.5-44.el7.x86_64.rpm
  - libstdc++-4.8.5-44.el7.x86_64.rpm
  - libstdc++-devel-4.8.5-44.el7.x86_64.rpm
- pcre 依赖清单（新版 pcre2-xxx 可能需要以下依赖，如果是旧版 pcre-8.45 应该不需要）
  - pcre-devel-8.32-17.el7.x86_64.rpm
  - pcre2-10.23-2.el7.x86_64.rpm

进入上传目录，安装以上 rpm 包

```bash
rpm -ivh --nodeps ...  # 依次安装
# or 批量安装命令
rpm -Uvh *.rpm --nodeps --force
```

> **批量安装需尽量保持只有当前文件夹内部只有上述 rpm 包**，`--nodeps` 为不依赖，批量安装时，其它 rpm 包可能会受到影响

- 验证安装（出现版本信息即安装成功）

```bash
gcc -v
```

#### 安装 pcre

下载地址：http://www.pcre.org/

> 其中有两个下载链接地址：旧版的 pcre 和新版的 pcre2，如果使用 pcre2，则需要安装对应的 rpm 依赖包

上传解压安装包：将下载好的安装包上传到服务器，并解压。新版解压出的文件名一般是 pcre2

```bash
tar -zxvf pcre2-10.42.tar.gz  # 解压
cd pcre2-10.42  # 进入文件夹
./configure
make && make install
```

#### 下载安装 zlib

- 下载 zlib：http://www.zlib.net/
- 上传解压安装包（操作和 安装 pcre 步骤一致）

## 下载 Nginx

去 [Nginx 官网](http://nginx.org/en/download.html) 下载对应的版本

![Nginx 下载](https://jsonq.top/cdn-static/2025/02/25/1740465680343-k58drs0g.jpg)

将 nginx 上传至服务器 `/data/software` 文件夹下解压

```bash
cd /data/software
tar -zxvf nginx-1.24.0.tar.gz  # 解压
mv nginx-1.24.0 nginx  # 重命名
```

## 安装 Nginx

配置 nginx

```bash
cd data/software/nginx
./configure  # 在此之前安装了 openssl 的相关依赖，这里就不会报错了
make && make install
```

启动 nginx

```bash
whereis nginx   #查找 nginx 文件，一般都在 /usr/local/nginx
cd /usr/local/nginx #进入该文件
cd ./sbin  #进入sbin文件
./nginx   #启动nginx程序
```

直接访问 IP 地址如下出现 Nginx 的页面就算 Nginx 环境部署完成

![ngixn安装成功](https://jsonq.top/cdn-static/2025/02/25/1740465680450-gnyx0e8h.jpg)

**至此，linux 的基本环境搭建已全部完成**

# 开启 https，安装 openssl 等相关依赖

<strong style={{color:"red"}}>以下内容仅作为临时参考，无实际应用，更详细的 openssl 安装与配置，需查看该文章：[Nginx 离线配置 ssl 证书](/post/deploy/nignx-use-https)</strong>

---

下载地址：https://www.openssl.org/source/

上传解压安装包：将下载好的安装包上传到服务器，并解压。

```bash
tar -zxvf openssl-1.1.1u.tar.gz  # 解压
cd openssl-1.1.1u  # 进入文件夹
./config
make && make install
```

安装完成后，控制台输入 `openssl version`,出现版本信息则说明安装成功。若出现类似错误：`openssl: error while loading shared libraries: libcrypto.so.1.1: cannot open shared object file: No such file or directory`，原因是 openssl 运行库位置不正确造成的。执行如下命令后重新查看。

```bash
ln -s /usr/local/lib64/libssl.so.1.1 /usr/lib64/libssl.so.1.1
ln -s /usr/local/lib64/libcrypto.so.1.1 /usr/lib64/libcrypto.so.1.1
```

# 前后端分离部署

在 data 文件夹下新建 project 文件，用来分别存放前后端的项目文件

## 后端部署

将打包的 jar 包上传至 `/data/project/server` 目录下

先运行 jar 包看是否有启动问题

```bash
java -jar xxx.jar

# 无问题时，可选择不挂断连接运行，关闭连接依然运行 jar 程序
nohup java -jar xxx.jar >logs.log &  # 指定输出文件为 logs.log，不指定，删除 >logs.log & 即可
```

> 用 nohub 命令启动 jar 包，是在后台不挂断运行，关闭终端窗口或者 `CTRL + C` 命令也不会终止程序。  
> 当用 nohub 命令启动 jar 包的时候，如果不指定日志输出文件，则所有的输出都会被重定向到当前目录的 `nohub.out` 文件中。

### 重新部署

新旧 jar 包替换重新部署

```bash
cd /data/project/server # 进入项目所在文件夹
ps -ef | grep java # 查看 java 中运行的进程PID

# 终止正在运行的 java 进程，将其终止
kill -9 # 终止所在的进程 例如：kill -9 21097

# 最后重新启动新的 jar 包
nohup java -jar xxx.jar >logs.log &
```

## 前端部署

同样打包上传至 `/data/project` 文件夹下，不需要做任何操作

### 配置 Nginx 代理

Nginx 的配置文件一般在 `/usr/local/nginx/conf/nginx.conf`

```bash
# 编辑 nginx.conf 文件
vi /usr/local/nginx/conf/nginx.conf
# 找到有关 server 的配置
server {
  listen       80;
  server_name  ip地址;
  charset utf-8;

  location / {
      root /data/project/dist; # 前端文件所在目录
      try_files $uri $uri/ /index.html;
      index  index.html index.htm;
  }

 # 前端以 /api 开头的请求都会转发到后端服务接口
 # 该代理方式可以视为 nginx 本地转发，非必需情况下，可以只保留后端运行端口，关闭 3306 6379等，防止被攻击
  location /api {
        proxy_pass http://ipxx:xxx/admin;
        proxy_set_header x-forwarded-for  $remote_addr;
  }
}
```

每次修改 nginx 之后都需要重启 Nginx

```bash
cd /usr/local/nginx/sbin/
./nginx -s reload
```

# 后端项目问题

## 字体缺失

项目内部代码使用验证码时，linux 上没有对应的字体，会出现以下错误：

`Cannot load from short array because "sun.awt.FontConfiguration.head" is null`

- 点击 [链接](http://mirror.centos.org/centos/7/os/x86_64/Packages/fontconfig-2.13.0-4.3.el7.x86_64.rpm) 下载 `fontconfig` 字体库的 rpm。
- 点击 [链接](http://mirror.centos.org/centos/7/os/x86_64/Packages/ttmkfdir-3.0.9-42.el7.x86_64.rpm) 下载 `ttmkdir` 自定义字体的 rpm

```bash
rpm -ivh fontconfig-2.13.0-4.3.el7.x86_64.rpm --nodeps --force
rpm -ivh ttmkfdir-3.0.9-42.el7.x86_64.rpm --nodeps --force
```

创建一个字体文件夹，从 Windows 的 `C:\Windows\Fonts` 文件中将程序所使用的字体，上传到 `myfonts` 文件夹下

```bash
cd /usr/share/fontconfig/
mkdir myfonts  # 创建字体文件目录
chmod -R 755 /usr/share/fontconfig/myfonts/  # 给该文件夹赋权
ttmkfdir -e /usr/share/X11/fonts/encodings/encodings.dir  # 执行 ttmkfdir 命令
```

查看字体配置文件中的字体路径，是否正确

```bash
vim /etc/fonts/fonts.conf

# 修改字体文件路径
<!-- Font directory list -->
<dir>/usr/share/fontconfig/myfonts</dir>
```

刷新字体缓存使配置对系统生效（不用重启 linux 服务器）

```bash
fc-cache  # 刷新字体换缓存
fc-list :lang=zh  # 查看字体是否安装成功
```
