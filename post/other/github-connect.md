---
title: 连接 Github 的 host 文件配置
date: 2025-02-13
---

# github 连接（代码提交）

vpn 代理对网页访问可以，对 github 的命令行无效，但是鉴于部分人没有代理软件，而且想要访问 GitHub，就只能去修改 `host` 文件，该文件位于 `C:\Windows\System32\drivers\etc` 下，host 的代理配置会经常更改，此处列出截至 2025-02-23 号的 host 文件配置。

```bash
185.199.111.154   github.githubassets.com
140.82.114.21     central.github.com
185.199.109.133   desktop.githubusercontent.com
# assets-cdn.github.com update failed
185.199.108.133   camo.githubusercontent.com
185.199.108.133   github.map.fastly.net
146.75.77.194     github.global.ssl.fastly.net
140.82.113.4      gist.github.com
185.199.110.153   github.io
140.82.113.4      github.com
140.82.113.6      api.github.com
185.199.109.133   raw.githubusercontent.com
185.199.110.133   user-images.githubusercontent.com
185.199.108.133   favicons.githubusercontent.com
185.199.108.133   avatars5.githubusercontent.com
185.199.108.133   avatars4.githubusercontent.com
185.199.108.133   avatars3.githubusercontent.com
185.199.110.133   avatars2.githubusercontent.com
185.199.108.133   avatars1.githubusercontent.com
185.199.108.133   avatars0.githubusercontent.com
185.199.110.133   avatars.githubusercontent.com
140.82.113.10     codeload.github.com
3.5.30.122        github-cloud.s3.amazonaws.com
3.5.25.209        github-com.s3.amazonaws.com
52.217.171.73     github-production-release-asset-2e65be.s3.amazonaws.com
16.15.177.130     github-production-user-asset-6210df.s3.amazonaws.com
54.231.197.9      github-production-repository-file-5c1aeb.s3.amazonaws.com
185.199.108.153   githubstatus.com
140.82.114.17     github.community
185.199.109.133   media.githubusercontent.com
```

如果需要实时获取最新的 host，可以访问 GitHub 仓库 https://github.com/fliu2476/gh-hosts
