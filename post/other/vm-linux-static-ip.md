---
title: Vmware 的 Linux 系统配置静态IP
date: 2025-05-03
---

vmware 总是给虚拟机变化 ip，经常连接出错，索性固定一下 ip，这里使用的是 Centos，只要是 Linux 系统理论上都可以，由于已经设置了 NAT 网络，所以都是灰色的。

## 在 Vmware 中更改网关和网段

点击【编辑】> 点击【虚拟网络编辑器】

![image](https://jsonq.top/cdn-static/2025/04/27/202505032051190.png)

选中【VMnet8】> 点击【更改设置】

![image](https://jsonq.top/cdn-static/2025/05/03/202505032055735.png)

更改【子网IP】> 更改【子网掩码】> 点击【NAT设置】

> 子网IP中的 88 可以根据自己需要修改，不改也可以
>
> **子网掩码必须为 `255.255.255.0`**

![image](https://jsonq.top/cdn-static/2025/05/03/202505032057923.png)

更改【网关IP】> 点击【确定】

> 这里直接点击 【确定】 即可。

![image](https://jsonq.top/cdn-static/2025/05/03/202505032100414.png)

## 修改虚拟机中的网卡配置文件

进入 Linux 系统，编辑配置文件

```bash
vi /etc/sysconfig/network-scripts/ifcfg-ens33
```

1. 将 `BOOTPROTO="dncp"` 改为 `BOOTPROTO="static"`
2. 新增下图的四个配置

- dhcp：表示自动获取IP
- static：静态IP
- IPADDR：IP地址，就是常规访问的ip，必须保证在前面所设置的 192.168.xx.0 ~ 192.168.xx.254 之间
- NETMASK：子网掩码，必须为 255.255.255.0
- GATEWAY：网关，与刚才 NAT 设置中的网关 IP 保持一致
- DNS1：域名解析服务器，与网关保持一致即可

![image](https://jsonq.top/cdn-static/2025/05/03/202505032105980.png)

## 重启网卡服务

```bash
systemctl stop network
systemctl start network

ip addr
```

![image](https://jsonq.top/cdn-static/2025/05/03/202505032110019.png)
