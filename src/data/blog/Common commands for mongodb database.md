---
author: Simon Smale
pubDatetime: 2024-01-03T20:40:08Z
title: MongDB的使用和常见指令
featured: true
draft: false
tags:
  - docs
  - FAQ
canonicalURL: https://smale.codes/posts/setting-dates-via-git-hooks/
description: MongoDB usage and common instructions.
---
## MongDB数据库的使用(nodejs背景)
1.首先下载MongDB
```html
npm i mongodb
```
2.下载完成后建立链接
```
//导入必须的构造函数
import { MongoClient } from 'mongodb'
//根据构造函数获取数据库实例对象
const client = new MongoClient(MongDB数据库的连接字符串);
//建立链接
await client.connect();
//导航到需要编辑的数据库集合
const database = client.db("blog");
//导航到需要编辑的数据库
const blog = database.collection("blog");
```
接下来就能对数据库进行各项操作了，以下是一些常见的MongDB数据库操作指令
```html
//1.插入操作
await blog.insertOne(commentWithDate);
//blog是上面获取到的数据库
//2.更新操作
blog.updateOne(
{ title: updates.frontmatter.title}, // 查询条件，找到要更新的文档
{  $set: {...updates.frontmatter,content:updates.content }} // 直接用新的覆盖，没有波及到的维持原样
);
//3.查找操作
blog.find({查询条件}).toArray()
//后面那个toArray()是将查询到的数据转成数组，可不要
//4.删除操作
blog.deleteOne({ field: value });
删除第一条符合条件的数据，deleteMany类似，不过是所有符合的数据
//5.数组新增操作
blog.updateOne(
{ title: updates.frontmatter.title}, // 查询条件，找到要更新的文档
{ $push: { 字段名: 要添加的值 } }
）
//这个可以在指定的数据库数据中的某个数组属性添加新的元素
```
