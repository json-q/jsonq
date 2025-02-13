使用 Github Action 的原因是，jenkins 占用的服务器资源较多，低配置服务器 jenkins 很容易资源打满。

# 了解 Github Action

什么是 GitHub Action？其实也很容易理解，如果你用过 github pages 或者 vercel 的话就不陌生，就是一个 CI/CD 服务。提交代码自动触发部署。那么如何让 github action 连接远程服务器触发部署呢？

网上大部分的教程都是基于 ssh + docker 部署的，说实在，目前有点玩不转 docker，所以已有的思路是：

- 本地代码提交
- 触发 GitHub Action
- 执行构建脚本（git pull、install、build 等）

> 其实脚本构建这一步和 Dockerfile 是一样的思路。

# SSH 连接服务器

## GitHub 需要的配置

使用 ssh 连接 服务器，需要 ssh 私钥，但是私钥不能直接写入配置文件，GitHub 提供了相关功能，可以理解为 `env`。

点击项目仓库的 Settings -> Secrets and variables -> Actions -> new repository secret，填入 key 和 value，多个 secret 需要多次创建，在 GitHub Action 中访问时以 object 对象格式访问。跟 js 的对象语法类似。key 就是对象 key，value 就是 对应的值。

![secret key 设置](https://static.jsonq.top/2024/10/18/160833150_c7e48db7-cc02-4031-9019-33f7f08091be.png)

> 比如 `new repository secret` 时添加了 key `SSH_PRIVATE_KEY`，那么在 GitHub Action 中访问时，就使用 `${{ secrets.SSH_PRIVATE_KEY }}`。

## 生成 SSH

ssh 公私钥在 `~/.ssh` 下，可以 cd 到该目录下 `ls` 查看。

如果只有一个 `authorized_keys`，则需要使用 `ssh-keygen` 生成公私钥对。具体步骤如下

- `ssh-keygen -t rsa -C "github action"` 生成公私钥对
  - 其中 `-C "github action"` 类似备注，可以省略
- 生成成功后 `ls` 查看，此时应该有三个文件 `id_rsa`、`id_rsa.pub`、`authorized_keys`
- `cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys`，设置公钥内容为 `authorized_keys` 文件的内容，
- `cat ~/.ssh/id_rsa` 将私钥内容添加到 GitHub 仓库的 Secret 中。

## 编写 Github Action

此处提供一个 nest 服务的 GitHub Action 示例：

在 项目根目录新建 `.github/workflows/deploy.yml` 文件，内容如下

```yml
name: Deploy-nest

on:
  push:
    branches:
      - server

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: ssh connect server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }} # ip address
          username: ${{ secrets.SSH_USER }} # server username
          key: ${{ secrets.SSH_PRIVATE_KEY }} # server ssh private key

      - name: Run Script to Deploy serve
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_USER: ${{ secrets.SSH_USER }}
          SERVER_PATH_REMOTE: ${{ secrets.SERVER_PATH_REMOTE }}
          APP_NAME: nest-oss
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan $SSH_HOST >> ~/.ssh/known_hosts
          ssh $SSH_USER@$SSH_HOST  << EOF
            cd $SERVER_PATH_REMOTE

            MAX_RETRIES=8
            RETRY_COUNT=0

            while [ \$RETRY_COUNT -lt \$MAX_RETRIES ]; do
              if git pull origin server; then
                break  # pull succesful exit
              else
                echo "Git pull failed, retrying (\$((RETRY_COUNT + 1)) of \$MAX_RETRIES)..."
                ((RETRY_COUNT++))
                sleep 5
              fi
            done

            # check if retry count exceeded
            if [ \$RETRY_COUNT -eq \$MAX_RETRIES ]; then
              echo "Failed to pull code after \$MAX_RETRIES attempts. Exiting."
              exit 1  # throw error
            fi
            npm install
            npm run build
            pm2 restart $APP_NAME || pm2 start dist/src/main.js --name $APP_NAME
          EOF
```

> 最重要的就是 ` Deploy to server` 这个阶段的脚本。简单来说就是连接远程服务器，进入项目目录，执行安装运行脚本，其实就跟正常开发使用命令差不多了，值得注意的是 `git pull` 阶段增加了错误重试机制，因为国内服务器直接拉取 GitHub 代码失败率较高。

# 服务器配置

## 安装 git node pm2

由于有 node 服务，所以需要 node 和 pm2 来管理，如果项目为 java 或者其它，也是同理配置好环境即可。

1. 安装 git

- `yum install git`
- `git config --global user.name "youer username"`
- `git config --global user.email "your email"`
- `git --version` 检查 git 是否安装成功

如果无法连接 github，可在 `/etc/hosts` 添加如下代码

```bash
52.69.186.44 github.com
151.101.64.133 raw.githubusercontent.com
```

2. 安装 node

- 下载 node16.x gz 压缩包（Centos7 最高支持到 node16）https://registry.npmmirror.com/binary.html?path=node/latest-v16.x/
- 上传到服务器解压 `tar -xvf node-v16.x.tar.gz`
- 配置环境变量：`vi /etc/profile`
  - 添加 `export PATH=$PATH/xxx/node16.x/bin`
  - `source /etc/profile` 刷新环境变量
  - `node -v` 检查 node 是否安装成功
  - > 其实这里就可以体现出 docker 的好处。直接在服务器安装的话，由于有操作系统版本限制，只能安装某些版本，而用 docker 则无需关心这个问题。

3. 安装 pm2

- `npm install pm2 -g`
- `pm2 -v` 检查 pm2 是否安装成功

> 这种实现方式是通过拉取仓库代码，运行打包脚本，从而达到部署的，因此，安装时的大量 `node_modules` 也会占用大量的空间存储，如果介意此种方式，且项目的运行不需要依托 node，例如前端项目，就可以仅上传 dist 目录即可。

简单运行和停止删除命令如下

- `pm2 start dist/src/main.js --name nest-oss`
- `pm2 stop nest-oss`
- `pm2 delete nest-oss`

![命令示例](https://static.jsonq.top/2024/10/21/091205140_image.png)

# 提交代码

此时提交代码就可以触发 GitHub Action 了。失败的话会有邮箱提示，详细信息可以查看 Action 控制台日志。

![cicd 成功示例](https://static.jsonq.top/2024/10/18/160833442_519a03d2-ed81-4cae-a0fb-9c4175f492dd.png)

## SSL 证书

证书相关请查看 [免费无限续期 SSL 证书](/post/deploy/ssl-cert.md)
