---
author: Sat Naing
pubDatetime: 2024-05-25T04:58:53Z
title: 本地运行YesPlayMusic项目时遇到的各种问题
slug:
  Various problems encountered when running YesPlayMusic projects locally
featured: true
draft: false
tags:
  - configuration
  - docs
description:
  Various problems encountered when running YesPlayMusic projects locally.
---
## 该文章是 Windows 上运行 YesPlayMusic 项目的指南


从 GitHub 克隆 YesPlayMusic 项目后，在本地环境配置和运行过程中会遇到一系列常见问题。本文将提供详细的解决步骤，帮助你成功运行这个优秀的音乐播放器项目。

1. 识别正确的运行命令

克隆项目后，首先需要确认正确的启动命令：

## 有些项目不使用 dev 命令启动，需要查看 package.json 中的可用脚本

例如，对于 YesPlayMusic，应该使用：
```html
npm run serve
```

2. 解决 Node.js 版本不兼容问题

运行 npm run serve 时，可能会遇到以下错误：
```html
WARN  Unsupported engine: wanted: {"node":"14 || 16"} (current: {"node":"v22.13.1","pnpm":"10.6.3"})

Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```

这是因为项目要求 Node.js 14 或 16 版本，而当前系统使用的是 v22.13.1。

最佳解决方案是使用 NVM 切换到兼容版本：
```html
# 下载并安装 nvm-windows
# 访问: https://github.com/coreybutler/nvm-windows/releases

# 验证 NVM 安装
nvm version

# 安装兼容版本的 Node.js
nvm install 16

# 切换到该版本
nvm use 16.20.2

# 确认版本已切换
node -v
```

3. 清理项目并重新安装依赖

安装正确的 Node.js 版本后，需要清理项目并重新安装依赖：
```html
# 删除现有的依赖和锁文件
rm -r -Force node_modules
rm -Force package-lock.json
rm -Force pnpm-lock.yaml

# 重新安装依赖
npm install
```

4. 解决依赖冲突问题

安装过程中可能会遇到以下依赖冲突：
```html
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Found: eslint@6.8.0
npm ERR! Could not resolve dependency:
npm ERR! peer eslint@">=7.0.0" from eslint-config-prettier@8.10.0
```

这是因为 eslint-config-prettier@8.10.0 需要 eslint 7.0.0 或更高版本，但项目使用的是 eslint@6.8.0。


最简单的解决方案是使用以下命令，用 legacy-peer-deps 标志忽略冲突：
```html
npm install --legacy-peer-deps
```

5. 修复 Electron 安装问题

完成基本依赖安装后，需要修复 Electron 的安装问题：
```html
# 删除现有的 electron 文件夹
rm -r -Force node_modules/electron

# 设置环境变量（针对中国网络优化）
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_CUSTOM_DIR="13.6.9"

# 单独安装 electron
npm install electron@13.6.9 --save-dev
```

6. 处理后续的依赖冲突

此时可能会再次遇到依赖冲突问题：
```html
npm ERR! code ERESOLVE
npm ERR! While resolving: eslint-config-prettier@8.10.0
npm ERR! Found: eslint@6.8.0
npm ERR! peer eslint@">= 1.6.0 < 7.0.0" from @vue/cli-plugin-eslint@4.5.19
```

这个问题原因复杂：eslint-config-prettier@8.10.0 需要 eslint@7.0.0 以上，但项目使用的是 eslint@6.8.0，而 @vue/cli-plugin-eslint 只支持 eslint < 7.0.0。

综合解决方案

最有效的方法是完全重置并使用 --legacy-peer-deps 安装所有依赖：

```html
# 清除现有的 node_modules
rm -r -Force node_modules

# 使用 --legacy-peer-deps 安装所有依赖
npm install --legacy-peer-deps

# 单独安装 electron (也使用 --legacy-peer-deps)
npm install electron@13.6.9 --save-dev --legacy-peer-deps
```

7. 启动项目

完成所有步骤后，就可以顺利启动项目了：
```html
npm run serve
```
总结

YesPlayMusic 是一个优秀的项目，但由于它使用了较旧的依赖版本，在现代 Node.js 环境中配置可能会遇到一些挑战。按照本指南的步骤操作，你应该能够成功地在本地运行这个项目，享受它提供的优质音乐播放体验。

主要解决方案包括：

使用 NVM 切换到兼容的 Node.js 版本

使用 --legacy-peer-deps 处理依赖冲突

设置 Electron 镜像加快下载

清理项目并重新安装依赖

希望这个指南对你有所帮助！
