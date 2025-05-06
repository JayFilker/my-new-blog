---
author: Sat Naing
pubDatetime: 2024-04-25T04:58:53Z
title: 发送请求时遇到的一些问题
slug: request-promble
featured: true
draft: false
tags:
  - configuration
  - docs
description: Some problems encountered when sending requests.
---
# 常见前端错误及解决方案

## 1. Unexpected token '<', "<!DOCTYPE "... is not valid JSON

错误信息示例：
```html
/myarchives/index.html Unexpected token '<', "<!DOCTYPE "... is not valid JSON
Stack trace: at JSON.parse (<anonymous>)
at successSteps (node:internal/deps/undici/undici:5719:27)
at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
at async file:///D:/Users/LinZhiJie/Downloads/my-blog/dist/server/pages/myarchives.astro.mjs?time=1746189737364:21:16
at async renderToAsyncIterable (file:///D:/Users/LinZhiJie/Downloads/my-blog/node_modules/astro/dist/runtime/server/render/astro/render.js:133:26)
```

原因分析

这个错误表明后端返回了 HTML 代码，而前端尝试将其作为 JSON 解析。常见原因有：
 
1. 配置错误，导致 API 返回 HTML 页面（通常是错误页面）而非预期的 JSON

2. 请求的 URL 错误，服务器返回了 HTML 页面

3. API 端点出现问题，返回了错误页面

解决方案

1. 检查并修复前端代码中的各项配置，确保配置正确

2. 验证请求 URL 是否正确

3. 确认后端接口是否正常工作

注：我遇到的情况大多是第三种，原因是在编辑博客时，部署在 Railway 的后端服务掉线了。进入 Railway 重新部署后端服务器后恢复正常。

2. Request with GET/HEAD method cannot have body
   
错误信息示例：
```html
14:43:20 [ERROR] Request with GET/HEAD method cannot have body.
Stack trace:
at node:internal/deps/undici/undici:13502:13
at async eval (D:\Users\LinZhiJie\Downloads\my-blog\src\pages\index.astro:25:27)
[...] See full stack trace in the browser, or rerun with --verbose.
```

原因分析

这个问题很直接：GET/HEAD 请求方法按照 HTTP 协议规范不能包含请求体(body)。

解决方案

如果后端需要数据进行检索，应该改用查询参数（query parameters）而非请求体：
```html
// 创建参数对象并转换为查询字符串
const params = new URLSearchParams({key1: 'value1', key2: 'value2'});
const url = `https://myblogvalue-production.up.railway.app/blog?${params.toString()}`;

// 发送不带请求体的 GET 请求
fetch(url);
```

3. Cannot read properties of undefined (reading 'MONGODB_URI')

错误信息示例：
```html
TypeError: Cannot read properties of undefined (reading 'MONGODB_URI')
at file://D:/Users/LinZhiJie/Downloads/myblogvalue/index.js:64:39
at Layer.handleRequest (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\lib\layer.js:152:17)
at next (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\lib\route.js:157:13)
at Route.dispatch (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\lib\route.js:117:3)
```

原因分析

这个错误主要是由于前端和后端在环境变量访问方式上的差异导致的。

解决方案

在 Node.js 后端中访问环境变量时，应使用 process.env：

```html
// ❌ 不正确的方式（通常用于前端框架如 Vite）
const MONGODB_URI = import.meta.env.MONGODB_URI;

// ✅ 正确的方式（适用于 Node.js 环境）
const MONGODB_URI = process.env.MONGODB_URI;
记得确保环境变量已正确设置，可以通过 .env 文件或部署平台的环境变量配置进行设置。
```

