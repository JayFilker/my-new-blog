---
author: Sat Naing
pubDatetime: 2022-09-20T04:58:53Z
title: astro-paper框架中的一些使用注意事项
slug: astro-paper框架中的一些使用注意事项
featured: true
draft: false
tags:
  - configuration
  - docs
description: Immediate and enhanced display in the astro-paper framework.
---
1. astro-paper框架不要用下载，直接克隆，下载的话就是一个简陋的页面，使用克隆才能获得成品，另外使用框架不需要先下载前置的astro，直接用就行。
```html
git clone https://github.com/satnaing/astro-paper.git my-blog
cd my-blog
npm i
```
2. 在astro-paper框架的背景下，想要实现前端状态管理，需要的不再是Atom，而是persistentAtom，以下是具体的实现方法示例：

```html
//首先在终端运行以下载必须的依赖
npm install nanostores @nanostores/persistent
//在类似jotai的util文件中：
import { persistentAtom } from "@nanostores/persistent";
// 创建一个类似 Jotai atom 的存储
export const contentStore = persistentAtom("user:loggedIn", false, {
encode: JSON.stringify,
decode: JSON.parse,
});
//在需要的ts组件中：
import { contentStore } from '@/store/content';
contentStore.set(true)
```
3. 在astro文件中如何获取表单数据，我的获取方式如下：
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
      
  });
</script>
```
4. 很重要的一点，在使用最新的astro-paper框架时，配置中可能有一些实际不支持，但却默认使用了的选项，一般出现这种情况在你npm run dev运行时会报错：
```html
[config] Astro found issue(s) with your configuration:

! experimental: Invalid or outdated experimental feature.
  Check for incorrect spelling or outdated Astro version.
  See https://docs.astro.build/en/reference/experimental-flags/ for a list of all current experiments.

19:14:52 [ERROR] Continuing with previous valid configuration
```
这时候就需要找到astro.config.ts文件，然后一个一个去测试，通过注释的方式测试各个配置对项目的影响
目前，会导致报错的配置有如下几个：
```html
  experimental: {
    svg: true,//这个svg实际上不支持，需要注释或删除
    responsiveImages: true,
    preserveScriptOrder: true,
  },
image: {
// Used for all Markdown images; not configurable per-image
// Used for all `<Image />` and `<Picture />` components unless overridden with a prop
// experimentalLayout: "responsive",
},
//上面这个image全部都不支持
```
