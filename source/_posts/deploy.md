---
title: 使用 Github Actions 自动部署 Hexo 博客
date: 2024-07-26 20:54:54
tags: [Hexo, Github Actions, 原创]
categories: [开发]
mathjax: true
---

最近迁移到了 Hexo。之前用 Jekyll 是因为可以直接部署到 Github Pages，以为 Hexo 好像没有这个功能。事实上 Hexo 也可以用 Github Actions 自动部署到 Github Pages。

首先建立了 Hexo 项目之后需要在 `_config.yml` 中的 `deploy` 部分配置好部署信息：

```yaml
deploy:
  type: git
  repo: 你的项目 git 地址，一定要是 ssh 的，不然用不了
```

接下来要生成一个 ssh 密钥给 Github Actions 用来部署。首先在本地生成一个 ssh 密钥，为了防止冲突记得生成到一个不一样的地址：

```bash
ssh-keygen -t rsa -b 4096 -C "your@email.com"
```

把 `id_rsa.pub` 文件内容复制到 Github 项目的 Deploy keys 里，然后把 `id_rsa` 文件内容复制到 Github Actions 的 Secrets 里，命名为 `DEPLOY_KEY`。

接下来在 `.github/workflows` 目录下新建 `deploy.yml` 文件，内容如下：

```yaml
name: Deploy Documentation
on:
  push:
    branches:
      - main
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - name: Configuration environment
        env:
          DEPLOY_KEY: ${{secrets.DEPLOY_KEY}}
        run: |
          sudo timedatectl set-timezone "Asia/Shanghai"    # 设置时区，因为发布时间不同会导致文章显示不出来
          mkdir -p ~/.ssh/
          echo "$DEPLOY_KEY:" | tr -d '\r' > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan github.com >> ~/.ssh/known_hosts
          git config --global user.name "your-name"
          git config --global user.email "your@email.com"
      - name: Setup pandoc
        uses: nikeee/setup-pandoc@v1   # 我使用了 pandoc 转换 md 到其他格式，所以需要安装
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '>=18'
      - name: Cache node modules
        uses: actions/cache@v1
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      - name: Setup Hexo and dependencies and Deploy
        run: |
          npm install hexo-cli -g
          npm install
          hexo clean
          hexo d
```

注意替换其中的 `your-name` 和 `your@email.com` 为你的真实信息。

然后应该可以了。