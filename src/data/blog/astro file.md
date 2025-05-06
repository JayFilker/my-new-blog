---
author: Sat Naing
pubDatetime: 2024-02-21T04:58:53Z
title: astro文件的ts组件使用
slug: astro-paper框架下的立即展示与更新展示
featured: true
draft: false
tags:
  - configuration
  - docs
description: astro file ts component usage.
---
## AstroPaper 框架的静态部署与动态更新策略

静态框架的特性与限制

使用 AstroPaper 框架搭建博客时，需要注意这是一个静态框架。部署到 Vercel 后，astro 文件中使用的数据会保持在部署时获取的状态，不会自动更新。无论数据获取方式是向后端 API 发送请求还是从项目文件系统读取，结果都是一样的。

优点：页面显示速度极快，因为在构建时已准备好所有数据。

缺点：数据更新需要手动重新部署，无法自动更新内容。

以下是项目中某个 astro 文件的部分代码，展示了这个问题：
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

getStaticPaths() 用于生成静态路由，决定哪些 slug 值可访问。这些值仅在部署时确定，新增的 .astro 文件在下次部署前无法通过路由访问。后续的集合获取也只在部署时执行一次。

解决方案：使用 React 组件实现动态更新

为解决 astro 文件数据不更新的问题，可以在 TypeScript (React) 组件中完成数据获取，然后将组件引入 astro 文件。由于 React 组件可以实时获取数据，这种方法可以绕过 astro 的静态限制。

注意：这种方法的缺点是数据实时获取会导致展示时有一定延迟，不如 astro 的预先渲染快速。

使用示例
Astro 文件部分：

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
const data = await responsedemo2.json();
const blogMessage = data.comments.filter((item:any) => (item.featured))
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



React 组件部分：
```html
import { useEffect, useState } from 'react'

export interface Props {
check: string,
size: string,
sure: boolean
}

interface Blog {
title: string;
modDatetime: string;
pubDatetime: string;
description: string;
draft: boolean;
featured: boolean;
}

export function RealCard(props: Props) {
const { check, size, sure } = props
// @ts-ignore
const [blogMessage, setBlogMessage] = useState<Blog[]>({title: "", modDatetime: "", pubDatetime: '', description: '', draft: undefined, feature: undefined});
const realCheck = check == 'featured' ? 'featured' : 'draft'

    async function send() {
        const responsedemo2 = await fetch(`https://myblogvalue-production.up.railway.app/blog`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache', // 防止缓存
            },
        });

        const data = await responsedemo2.json();
        setBlogMessage(data.comments.filter((item: Blog) => (sure ? item[realCheck] : !item[realCheck])))
    }
    
    useEffect(() => {
        send()
    }, [])
    
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
    
    function formatDate(date: Date) {
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
        {blogMessage.length > 0 ? blogMessage.map((item: any, index: number) => (
            <>
                <div key={index}>
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
                        }
                    </a>
                    <div style={{color:'white'}}>{item.modDatetime ? `Updated: ${formatDate(new Date(item.modDatetime))}` : `PubDatetime: ${formatDate(new Date(item.pubDatetime))}`}</div>
                    <p style={{color:'white'}}>{item.description}</p>
                </div>
                <br/>
            </>
        )) : ''}
    </div>
}
```

重要注意事项

客户端渲染指令：

当在 astro 文件中使用涉及数据获取的 TS 组件时，必须加上 client:only="react" 指令，否则数据将无法获取。这个指令表示组件仅在客户端使用 React 进行渲染，不进行服务器端渲染。

其他可能用到的客户端指令：

client:load ：控制组件的水合（hydration）时机，使组件在页面加载完成后立即在客户端进行水合处理。在通过 TS 组件渲染 markdown 样式的输入框时需要使用，否则样式会失效变成普通多行输入框。

Markdown 内容渲染：

如果需要按 markdown 格式显示数据，可使用以下方法：
```html
import { marked } from 'marked'
<p className="text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: marked(comment.text) }}></p>
```

通过这种方式，可以在AstroPaper 框架的基础上实现内容的动态更新功能。
