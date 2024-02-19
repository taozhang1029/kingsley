#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
yarn docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 注意！！！在 Git 2.28 版本以后，主分支默认被定义为“main”，而不是“master”。所以这里必须写 main:gh-pages。如果写 master:gh-pages，会出现 src refspec master does not match any 错误。
git push -f git@github.com:taozhang1029/blog.git main:gh-pages

cd -
