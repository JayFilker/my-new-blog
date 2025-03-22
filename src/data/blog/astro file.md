---
author: Sat Naing
pubDatetime: 2022-09-21T04:58:53Z
title: astro文件的ts组件使用
slug: astro-paper框架下的立即展示与更新展示
featured: true
draft: false
tags:
  - configuration
  - docs
description: astro file ts component usage.
---
  &nbsp;&nbsp;在使用astro-paper框架搭建自己的博客时，需要注意这个框架是静态（static）的，在部署到vercel上之后，astro文件中需要用到的数据会一直用部署时获取到的数据而不会自我更新， 在这一点上不管获取数据时用的是向后端api发送请求还是直接使用文件存储系统从项目中获取文章都是一样的，这种获取数据方式的优点是显示非常快，因为在展示前数据就已经准备好了，但缺点是如果想更新数据，就得手动重新部署而无法完成自我更新。
以下是项目中某个astro文件的部分代码
```html
export async function getStaticPaths() {
const posts = await getCollection("blog", ({ data }) => !data.draft);
const postResult = posts.map(post => ({
params: { slug: getPath(post.id, post.filePath, false) },
props: { post },
}));

return postResult;
}

const { post } = Astro.props;

const posts = await getCollection("blog");
const sortedPosts = getSortedPosts(posts);
```
代码中getStaticPaths()用于表示xxx.astro文件存在，当链接导向xxx.astro文件时，只要xxx在slug中有就能跳转，而slug中有哪些文件名是在部署时决定的，当有新的xxx.astro文件出现时，getStaticPaths()中的slug并不会增加对应的名字，无法跳转直到下次部署。 之后的获取集合也是，只会在部署时更新一次。
## 对于astro文件的数据不更新问题，我的解决方法是在ts组件中完成数据获取，然后再将ts组件引入astro文件中，由于ts组件是实时获取数据的，因此这个方法可以解决astro文件不更新数据的问题，但这个方法也有一个缺点，就是由于数据是实时获取的，导致展示数据时相较于astro的提前渲染会有一定的延迟
以下是使用示例：

astro部分：
```html
---
import { RealCard } from "@/components/card.tsx";
...省略其他导入语句
const responsedemo2 = await fetch(`https://myblogvalue-production.up.railway.app/blog`, {
method: 'GET',
headers: {
'Content-Type': 'application/json',
'Cache-Control': 'no-cache', // 防止缓存
},
});
const data =await responsedemo2.json();
const blogMessage=data.comments.filter((item:any)=>(item.featured))
---
{
blogMessage.length > 0 && (
<>
<section id="featured" class="pt-12 pb-6">
    <h2 class="text-2xl font-semibold tracking-wide">Featured</h2>
    <RealCard check="featured" size="h3" sure={true} client:only="react"/>
</section>
{blogMessage.length > 0 && <Hr />}
</>
)
}
```
ts组件部分：
```html
import { useEffect, useState } from 'react'
export interface Props {
    check:string,
    size:string,
    sure:boolean
}
interface Blog {
    title: string;
    modDatetime: string;
    pubDatetime: string;
    description:string;
    draft:boolean;
    featured:boolean;
}
export function RealCard(props: Props) {
    const {check,size,sure} = props
    // @ts-ignore
    const  [blogMessage, setBlogMessage] = useState<Blog[]>({title: "",modDatetime: "", pubDatetime: '', description:'',draft:undefined,feature:undefined});
    const realCheck= check=='featured'?'featured':'draft'
    async function send(){
        const responsedemo2 = await fetch(`https://myblogvalue-production.up.railway.app/blog`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache', // 防止缓存
            },
        });

        const data = await responsedemo2.json();
        setBlogMessage(data.comments.filter((item:Blog)=> (sure?item[realCheck]:!item[realCheck])))
    }
    useEffect(() => {
        send()
    },[])
    function slugify(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')       // 替换空格为 -
            .replace(/&/g, '-and-')     // 替换 & 为 'and'
            .replace(/[^\w\-]+/g, '')   // 移除非单词字符
            .replace(/\-\-+/g, '-');    // 替换多个 - 为单个 -
    }
    const headerProps = {
        class: "text-lg font-medium decoration-dashed hover:underline",
    };
    function formatDate(date:Date) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // 转换为12小时制
        hours = hours % 12;
        hours = hours ? hours : 12; // 0应显示为12
        
        return `${day} ${month}, ${year} | at ${hours}:${minutes} ${ampm}`;
    }
    return <div>
        {blogMessage.length > 0?blogMessage.map((item: any,index:number) => (<>
            <div key={index}   >
                <a
                    href={`/myposts/${slugify(item.title)}`}
                    className="inline-block text-lg font-medium text-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
                >
                    {
                        size === "h2" ? (
                            <h2 {...headerProps} style={{viewTransitionName: slugify(item.title)}}>{item.title}</h2>
                        ) : (
                            <h3 {...headerProps} style={{viewTransitionName: slugify(item.title)}}>{item.title}</h3>
                        )
                    }</a>
                    <div style={{color:'white'}}>{item.modDatetime?`Updated:${formatDate(new Date(item.modDatetime))}`:`PubDatetime:${formatDate(new Date(item.pubDatetime))}`}</div>
                    <p style={{color:'white'}}>{item.description}</p>
                
            </div>
            <br/>
            </>
            )):''}
    </div>
}
```
## 这里有个注意点，当在astro文件中要使用涉及到数据获取的ts组件时，需要加上client:only="react"，不然数据是获取不到的
它的意思是控制组件的加载和渲染方式，指定某个组件仅在客户端使用 React 进行渲染，不进行服务器端渲染。

另外既然提到了client，就顺便介绍下client:load，这个用于控制组件的水合（hydration）时机。它使组件在页面加载完成后立即在客户端进行水合处理。在通过ts组件渲染markdown样式的输入框的时候需要使用到他，不然样式就会失效变成普通的多行输入框。

还有如果想要让数据按markdown的形式显示，那就需要以下步骤：
```html
import { marked } from 'marked'
<p className="text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: marked(comment.text) }}></p>
```
