---
author: Sat Naing
pubDatetime: 2022-09-24T04:58:53Z
title: 发送请求时遇到的一些问题
slug: request-promble
featured: true
draft: false
tags:
  - configuration
  - docs
description: Some problems encountered when sending requests.
---

## 1.Unexpected token '<', "<!DOCTYPE "... is not valid JSON
有时候我们在获取数据时会遇到Unexpected token '<', "<!DOCTYPE "... is not valid JSON的错误，以下是一个例子:


```text
/myarchives/index.htmlUnexpected token '<', "<!DOCTYPE "... is not valid JSON Stack trace: at JSON.parse (<anonymous>)
at successSteps (node:internal/deps/undici/undici:5719:27)
at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
at async file:///D:/Users/LinZhiJie/Downloads/my-blog/dist/server/pages/myarchives.astro.mjs?time=1746189737364:21:16
at async renderToAsyncIterable (file:///D:/Users/LinZhiJie/Downloads/my-blog/node_modules/astro/dist/runtime/server/render/astro/render.js:133:26)
```
当遇到这种类型的错误时，表明后端返回了一个HTML代码，而我们将其视为json来解析，这通常发生在以下情况：
1.配置出错，导致API 返回了 HTML 页面（可能是错误页面）而不是预期的 JSON
2.请求的 URL 错误，导致服务器返回了 HTML 页面
3.API 端点出现问题，返回了错误页面
解决方案
1. 检查并修复前端代码中的各项配置，确保配置没写错 
2. 检查请求 URL 是否正确
3. 确认后端接口是否正常工作
我遇到的情况大多是3，原因是在编辑博客时部署在railway的后端掉线了，进入railway重新部署一下后端服务器就恢复正常了
## 2.Request with GET/HEAD method cannot have body.
```
   14:43:20 [ERROR] Request with GET/HEAD method cannot have body.
   Stack trace:
   at node:internal/deps/undici/undici:13502:13
   at async eval (D:\Users\LinZhiJie\Downloads\my-blog\src\pages\index.astro:25:27)
   [...] See full stack trace in the browser, or rerun with --verbose.
```
这个问题很简单，就是get请求是没有请求体的，如果后端需要数据进行检索，可以把后端的数据来源从请求体改成查询参数,带请求参数的路径如下：
```
`https://myblogvalue-production.up.railway.app/blog?${params.toString()}`
```
## 3.Cannot read properties of undefined (reading 'MONGODB_URI')
这个错误主要是因为后端的nodejs的环境变量设置于前端有所不同，以下是具体错误代码
```
TypeError: Cannot read properties of undefined (reading 'MONGODB_URI')
at file://D:/Users/LinZhiJie/Downloads/myblogvalue/index.js:64:39
at Layer.handleRequest (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\lib\layer.js:152:17)
at next (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\lib\route.js:157:13)
at Route.dispatch (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\lib\route.js:117:3)
at handle (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\index.js:435:11)
at Layer.handleRequest (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\lib\layer.js:152:17)
at D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\index.js:295:15
at processParams (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\index.js:582:12)
at next (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\router\index.js:291:5)
at SendStream.error (D:\Users\LinZhiJie\Downloads\myblogvalue\node_modules\serve-static\index.js:120:7)
```
解决方式是更改在使用环境变量时：
```text
[//]: # (不用)
const MONGODB_URI = import.meta.env.MONGODB_URI;

[//]: # (而是用)
const MONGODB_URI = process.env.MONGODB_URI;
```

