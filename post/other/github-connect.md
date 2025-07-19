---
title: 连接 Github 的 host 文件配置
date: 2025-02-13
---

## github 连接（代码提交）

如果需要实时获取最新的 host，可以访问 GitHub 仓库 https://github.com/fliu2476/gh-hosts

vpn 代理对网页访问可以，对 github 的命令行无效，但是鉴于部分人没有代理软件，而且想要访问 GitHub，就只能去修改 `host` 文件，该文件位于 `C:\Windows\System32\drivers\etc` 下，修改后记得刷新 DNS

- Windows 刷新 DNS： `ipconfig /flushdns`
- Linux 刷新 DNS： `sudo systemctl restart nscd`
