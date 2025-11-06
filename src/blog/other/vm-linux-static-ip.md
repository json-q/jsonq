---
title: Vmware 的 Linux 系统配置静态IP
pubDate: 2025-05-03
description: 在 Vmware 中 Linux 系统（Centos7/9）配置静态IP地址，避免IP变动导致的连接问题
tags:
  - 其它
---

vmware 总是给虚拟机变化 ip，经常连接出错，索性固定一下 ip，这里使用的是 Centos，只要是 Linux 系统理论上都可以，由于已经设置了 NAT 网络，所以都是灰色的。

## Table of contents

## 在 Vmware 中更改网关和网段

> 这个一般情况下是不需要改的，VM 默认的就是

点击【编辑】> 点击【虚拟网络编辑器】

![image](https://jsonq.top/cdn-static/2025/04/27/202505032051190.png)

选中【VMnet8】> 点击【更改设置】

![image](https://jsonq.top/cdn-static/2025/05/03/202505032055735.png)

更改【子网 IP】> 更改【子网掩码】> 点击【NAT 设置】

> 子网 IP 中的 88 可以根据自己需要修改，不改也可以
>
> **子网掩码必须为 `255.255.255.0`**

![image](https://jsonq.top/cdn-static/2025/05/03/202505032057923.png)

更改【网关 IP】> 点击【确定】

> 这里直接点击 【确定】 即可。

![image](https://jsonq.top/cdn-static/2025/05/03/202505032100414.png)

## 修改虚拟机中的网卡配置文件

进入 Linux 系统，编辑配置文件

**Centos 7 的配置文件一般在 `/etc/sysconfig/network-scripts` 下，Centos 9 的在 `/etc/NetworkManager/system-connections`，具体的配置名可使用 `ip addr` 查看就行**

### Centos 7

```bash
vi /etc/sysconfig/network-scripts/ifcfg-ens33
```

1. 将 `BOOTPROTO="dncp"` 改为 `BOOTPROTO="static"`
2. 新增下图的四个配置

- dhcp：表示自动获取 IP
- static：静态 IP
- IPADDR：IP 地址，就是常规访问的 ip，必须保证在前面所设置的 192.168.xx.0 ~ 192.168.xx.254 之间
- NETMASK：子网掩码，必须为 255.255.255.0
- GATEWAY：网关，与刚才 NAT 设置中的网关 IP 保持一致
- DNS1：域名解析服务器，与网关保持一致即可

![image](https://jsonq.top/cdn-static/2025/05/03/202505032105980.png)

### Centos 9

```bash
vi /etc/NetworkManager/system-connections/es160.nmconnection
```

```bash
[connection]
id=ens160
uuid=5d896bda-c62a-3eb1-bc29-7c031232db86
type=ethernet
autoconnect-priority=-999
interface-name=ens160
timestamp=1670979495

[ethernet]

[ipv4]
# mehod=auto     # 可以注释掉也可以直接改
method=manual    # 改成manual(意思是设置手动模式)
address1=192.168.192.128/24,192.168.192.2   # 静态ip/子网掩码长度(255.255.255.0 长度为 24), 网关
dns=114.114.114.114,8.8.8.8   # dns地址，用 , 隔开

[ipv6]
addr-gen-mode=eui64
method=auto

[proxy]
```

## 重启网卡服务

```bash
# Centos 7
systemctl stop network
systemctl start network

# Centos 9
nmcli c reload ens160 # 或 systemctl restart NetworkManager.service

ip addr
```

![image](https://jsonq.top/cdn-static/2025/05/03/202505032110019.png)

## 设置镜像 yum 源

### Centos 7

参照 https://www.cnblogs.com/kohler21/p/18331060 即可

### Centos 9

先找到配置 yum 源的文件

```bash
cd /etc/yum.repos.d
ls
```

拷贝两个文件以防万一

```bash
cp /etc/yum.repos.d/centos.repo /etc/yum.repos.d/centos.repo.backup-20250827
cp /etc/yum.repos.d/centos-addons.repo /etc/yum.repos.d/centos-addons.repo.backup-20250827
```

修改 centos.repo

```bash
[baseos]
name=CentOS Stream $releasever - BaseOS
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/BaseOS/$basearch/os/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
countme=1
enabled=1

[baseos-debug]
name=CentOS Stream $releasever - BaseOS - Debug
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/BaseOS/$basearch/debug/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[baseos-source]
name=CentOS Stream $releasever - BaseOS - Source
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/BaseOS/source/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[appstream]
name=CentOS Stream $releasever - AppStream
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/AppStream/$basearch/os/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
countme=1
enabled=1

[appstream-debug]
name=CentOS Stream $releasever - AppStream - Debug
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/AppStream/$basearch/debug/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[appstream-source]
name=CentOS Stream $releasever - AppStream - Source
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/AppStream/$basearch/debug/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[crb]
name=CentOS Stream $releasever - CRB
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/CRB/$basearch/os/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
countme=1
enabled=0

[crb-debug]
name=CentOS Stream $releasever - CRB - Debug
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/CRB/$basearch/debug/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[crb-source]
name=CentOS Stream $releasever - CRB - Source
baseurl=https://mirrors.aliyun.com/centos-stream/$stream/CRB/source/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0
```

修改 centos-addons.repo

```bash
[highavailability]
name=CentOS Stream $releasever - HighAvailability
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/HighAvailability/$basearch/os/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
countme=1
enabled=0

[highavailability-debug]
name=CentOS Stream $releasever - HighAvailability - Debug
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/HighAvailability/$basearch/debug/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[highavailability-source]
name=CentOS Stream $releasever - HighAvailability - Source
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/HighAvailability/source/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[nfv]
name=CentOS Stream $releasever - NFV
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/NFV/$basearch/os/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
countme=1
enabled=0

[nfv-debug]
name=CentOS Stream $releasever - NFV - Debug
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/NFV/$basearch/debug/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[nfv-source]
name=CentOS Stream $releasever - NFV - Source
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/NFV/source/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[rt]
name=CentOS Stream $releasever - RT
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/RT/$basearch/os/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
countme=1
enabled=0

[rt-debug]
name=CentOS Stream $releasever - RT - Debug
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/RT/$basearch/debug/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[rt-source]
name=CentOS Stream $releasever - RT - Source
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/RT/source/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[resilientstorage]
name=CentOS Stream $releasever - ResilientStorage
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/ResilientStorage/$basearch/os/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
countme=1
enabled=0

[resilientstorage-debug]
name=CentOS Stream $releasever - ResilientStorage - Debug
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/ResilientStorage/$basearch/debug/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[resilientstorage-source]
name=CentOS Stream $releasever - ResilientStorage - Source
baseurl=http://mirrors.aliyun.com/centos-stream/$stream/ResilientStorage/source/tree/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0

[extras-common]
name=CentOS Stream $releasever - Extras packages
baseurl=http://mirrors.aliyun.com/centos-stream/SIGs/$stream/extras/$basearch/extras-common/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-SIG-Extras-SHA512
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
countme=1
enabled=1

[extras-common-source]
name=CentOS Stream $releasever - Extras packages - Source
baseurl=http://mirrors.aliyun.com/centos-stream/SIGs/$stream/extras/source/extras-common/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-SIG-Extras-SHA512
gpgcheck=1
repo_gpgcheck=0
metadata_expire=6h
enabled=0
```

更新缓存

```bash
yum makecache

yum update
```

## 教程

- vm 安装教程（网络的静态 ip 不随教程走）：https://blog.csdn.net/qq_45743985/article/details/121152504
- Centos9 安装教程：https://blog.csdn.net/qq_44870331/article/details/129988704
