---
author: Sat Naing
pubDatetime: 2024-01-13T04:58:53Z
title: astro-paper框架中的一些使用注意事项
slug: astro-paper框架中的一些使用注意事项
featured: true
draft: false
tags:
  - configuration
  - docs
description:
  Some usage notes in the astro-paper framework.
---

## AstroPaper 框架使用指南

1. 框架安装与设置

正确获取完整项目

AstroPaper 框架不应该通过npm下载的方式获取，这样只会得到一个简陋的页面版本。正确的方法是通过 Git 克隆完整仓库：
```html
git clone https://github.com/satnaing/astro-paper.git my-blog
cd my-blog
npm i
#使用框架不需要预先安装 Astro，克隆后直接使用即可。
```


2. 前端状态管理

在 AstroPaper 框架中实现前端状态管理时，推荐使用 persistentAtom 而非普通的 Atom，这样可以在页面刷新后保持状态。

实现步骤:


```html
安装必要依赖：
npm install nanostores @nanostores/persistent
创建持久化状态存储（类似 Jotai atom 的实现）：
// store/content.ts
import { persistentAtom } from "@nanostores/persistent";

// 创建一个持久化的存储
export const contentStore = persistentAtom("user:loggedIn", false, {
encode: JSON.stringify,
decode: JSON.parse,
});
在 TypeScript 组件中使用：
import { contentStore } from '@/store/content';

// 设置状态
contentStore.set(true);

// 使用状态
const isLoggedIn = contentStore.get();

// 监听状态变化
contentStore.subscribe(value => {
console.log("登录状态变更:", value);
});
```

3. 在 Astro 文件中获取表单数据

Astro 文件中获取表单数据的方法示例：
```html
<form id="myForm">
  <input type="text" name="username" placeholder="用户名" />
  <input type="email" name="email" placeholder="邮箱" />
  <button type="button" id="submitButton">提交</button>
</form>

<script>
  document.getElementById('submitButton').addEventListener('click', () => {
    // 首先根据表单创建FormData实例对象 
    const form = document.getElementById('myForm');
    const formData = new FormData(form);
    
    // 获取特定表单项
    const username = formData.get('username');
    const email = formData.get('email');
    
    console.log("表单数据:", { username, email });
    
    // 可以继续处理数据，如发送到服务器
    // fetch('/api/submit', {
    //   method: 'POST',
    //   body: formData
    // })
  });
</script>
```

4. 常见配置问题与解决方案

使用最新版 AstroPaper 框架时，可能会遇到配置兼容性问题。当运行 npm run dev 时，可能出现以下错误：
```html
[config] Astro found issue(s) with your configuration:

! experimental: Invalid or outdated experimental feature.
Check for incorrect spelling or outdated Astro version.
See https://docs.astro.build/en/reference/experimental-flags/ for a list of all current experiments.

19:14:52 [ERROR] Continuing with previous valid configuration
```

解决方法

需要修改 astro.config.ts 文件，删除或注释掉不支持的配置项。目前已知的问题配置包括：
```html
// 需要删除或注释的配置项：
experimental: {
svg: true,  // 不支持，需注释或删除
responsiveImages: true,
preserveScriptOrder: true,
},

image: {
// 以下整个 image 配置块不支持
// experimentalLayout: "responsive",
},
```

通过逐一注释这些配置项进行测试，确定哪些导致了错误，然后删除或替换为当前版本支持的选项。

4. 动态数据加载与静态部署

如前文所述，AstroPaper 作为静态框架，在数据加载方面有其特定的工作方式。使用客户端组件（client:only="react"）可以实现动态数据加载，确保内容实时更新，而不受静态生成的限制。

通过遵循以上指南，可以充分利用 AstroPaper 框架的强大功能，同时避免常见的配置和使用问题。
