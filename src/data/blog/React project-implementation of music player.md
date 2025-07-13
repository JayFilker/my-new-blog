---
author: Sat Naing
pubDatetime: 2025-07-09T04:58:53Z
title: 实现react项目-音乐播放器的具体流程
slug: 音乐播放器
featured: true
draft: false
tags:
  - react
  - docs
description: How to implement a music player based on React + TypeScript + Vite.
---

&nbsp;&nbsp;今天我将与大家分享的这个项目是一个基于React + TypeScript +
Vite，面向spotify用户的现代化第三方音乐播放器，功能除了作为音乐播放器最基本的播放、暂停、上下一首音乐以外，还包括播放MV视频，自定义个人风格，展示歌词等等一系列额外功能。<br>
&nbsp;&nbsp;这个项目不仅巩固了我的前端技能，也让我深入理解了音频处理的相关知识，涉及到包括但不限Jotai原子化状态管理、@tanstack/react-query等等技术栈。下面我将详细地为大家介绍这个项目的实现流程：

## 1.首先，要实现一个靠谱的项目，就得先做好需求分析，为项目需要实现哪些核心功能做一个简单的规划，同时还要思考一下想实现这些需求，得用到哪些技术栈和关键依赖。

### 在开始编码前，我确定了以下需求：

- 音乐的播放、暂停、上一首/下一首切换
- 音量控制与进度条拖拽
- 默认、循环、随机三种播放模式
- 专辑、歌单以及艺人的信息展示
- 按标签搜索和按关键字搜索两种搜索模式
- 歌词显示
- MV视频播放
- 实现页面翻译
- 收藏功能

### 紧接着是根据这些需求，确定项目用的技术栈和关键依赖：

- 要完成一个音乐播放器APP，选择一个合适的前端框架很重要，而在众多前端框架中，考虑到个人的熟练度，我决定使用 React +
  TypeScript 作为项目的基础框架，利用 Vite 作为构建工具来提升开发效率。
- 在实现播放状态、音量、播放模式等等需求的过程中，免不了要使用到全局状态，因此在考虑到自己的实际情况后，我决定在播放器中引入使用原子化状态管理，相对来说更为简洁，且能够避免不必要的重渲染的
  Jotai 作为状态管理库。
- 在项目的开发过程中，处理 HTTP 请求是必不可少的一环，对于此，我决定使用既熟悉，相对于原生 fetch 又更加强大和易用的 axios 。
- 在 axios 的基础上，为了更好地进行数据获取和缓存，优化与Spotify API的交互，我决定引入 @tanstack/react-query 进行项目的优化。
- 为了处理组件间通信问题，选择使用 mitt 作为事件总线。
- 处理应用内路由导航的过程中，考虑对相关工具的了解程度，我最终还是决定使用 react-router-dom。
- 为了让项目可以提供多语言国际化支持，实现页面翻译功能，我决定使用 i18next 。

## 2.然后就是项目结构与环境的搭建，以下，便是我这个音乐播放器的项目结构与环境

### 项目结构：

```text
src/
├── api/该目录用于存放与后端交互的所有逻辑，内部文件主要是不同资源的API调用封装而成的独立
│ 服务文件，以达到使API调用逻辑与UI组件完全分离，提高代码的可维护性和可测试性的目的。
├── assets/该目录主要用于存放一些静态资源，例如全局css文件，icon文件等等
├── components/该目录用于存放项目中的各个UI组件
│   ├── Bar/进度条
│   ├── ...
│   └── Volume/音量条
├── pages/该目录用于存放各个路由对应页面
│   ├── Artist/作者页
│   ├── ...
│   └── Set/设置页
├── store/状态管理目录
├── types/TypeScript类型定义
└── utils/事件总线
```

### 环境搭建 ：

项目初始化步骤:<br />
1.使用Vite创建 TypeScript + React 项目基础结构:

```sh
npm create vite@latest music-player -- --template react-ts
cd music-player
```

安装基本依赖：

```sh
npm install
```

配置 TypeScript 和 ESLint：

```shell
npm install -D @antfu/eslint-config typescript-eslint eslint
```

配置核心状态管理和路由依赖：

```shell
npm install react-router-dom jotai @tanstack/react-query axios
```

## 3.核心功能实现

### 3.1 音乐播放功能

&nbsp;&nbsp;本应用是基于spotify的第三方播放器，因此要实现音乐播放功能，首先得做好前期工作，根据 spotify API 说明文档完成后端部分的获取
spotify
密钥，重定位，过期刷新等步骤，并进行初始化。
<br />
<br />
&nbsp;&nbsp;而在完成这些步骤之后，就能开始实现音乐播放功能了。以下，是我实现音乐播放功能的步骤：

1. 首先在 src/api 目录下创建一个 ts 文件，用于封装 Spotify API 的调用逻辑：

```typescript
import { put } from '@/api/axios'
import { useMutation } from '@tanstack/react-query'

export function playTrackPut(trackUri: string, deviceId: any) {
    return put(`/me/player/play?device_id=${deviceId}`, {
        uris: [trackUri],
    })
}

export function usePlayTrackPut() {
    return useMutation({
        mutationFn: ({trackUri, deviceId}: {trackUri: string, deviceId: any}) =>
            playTrackPut(trackUri, deviceId),
    })
}
```

2. 然后就是在组件中调用

```typescript
import { Device, IsPlayingDemo } from '@/store/atom'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { usePlayTrackPut } from '@/api/spotifyApi'

const [deviceId, setDeviceId] = useAtom(Device)
const [, setIsPlaying] = useAtom(IsPlayingDemo)
const {mutate: playTrackDemo} = usePlayTrackPut()
const playTrack = async (trackUri: string) => {
    if (!deviceId) {
        return '失败'
    }
    // deviceId是设备id，用于防止在初始化完成前就进行播放导致的播放逻辑冲突，这会让之后的正常播放也无法进行
    setIsPlaying(true)
    // 这个是用于控制播放图标从暂停变为播放
    playTrackDemo({trackUri, deviceId})
    // 
}
```
之后的暂停、恢复播放、上一首/下一首切换、音量控制与进度条拖拽的实现原理都类似，都是在api目录中封装 Spotify API 调用逻辑，然后在组件中再进行二次加工成函数使用，就不过多赘述了。
### 3.2 实现默认、循环、随机三种播放模式

首先，我将这三种模式的的触发方法都存放在一个数组中

```typescript
import { MusicList } from '@/store/atom'
import { useAtom } from 'jotai'

const [musicList, setMusicList] = useAtom(MusicList)
// 方法部分：
const functions = [
    {
        title: '循环播放',
        meth: () => {
            setMusicList(musicList.map((item: any, index: number) => index === 1 ? !item : item))
        },
        style: {color: musicList[1] ? 'white' : '#335eea', opacity: 1},
        icon: svgList.loopPlayback,
    },
    {
        title: '随机播放',
        meth: () => {
            setMusicList(musicList.map((item: any, index: number) => index === 2 ? !item : item))
        },
        style: {color: musicList[2] ? 'white' : '#335eea', opacity: 1},
        icon: svgList.randomPlay,
    },
//      这里方法的作用是当点击时修改musicList数组中对应的元素的值
]
```
然后通过useEffect在歌曲结束时根据musicList数组的值来判断当前的播放模式，并进行相应的处理：
```typescript
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { MusicList, CountDemo, PlayerDemo, CurrentSongList } from '@/store/atom'
const [musicList] = useAtom(MusicList)
const [count, setCount] = useAtom(CountDemo)
const [player] = useAtom(PlayerDemo)
const [currentSong] = useAtom<{ items: Array<any> }>(CurrentSongList)
const [prevTime, setPrevTime] = useState(0)
useEffect(() => {
    if ((player.currentTrackDuration - player.progress < 1) && (Date.now() - prevTime > 1000)) {
        // 当音乐结束时触发
        setPrevTime(Date.now())
        if (!musicList[2]) {
            const randomIndex = Math.floor(Math.random() * currentSong.items.length)
            setCount(randomIndex)
            // 这个是用来设置当前是哪一首歌
            playTrack(currentSong.items[randomIndex].uri)
        //     随机模式，随机抽取一首歌播放
        } else if (!musicList[1]) {
            playTrack(currentSong.items[count].uri)
        //     循环模式 ，重复播放同一首歌
        } else {
            if (count !== currentSong.items.length - 1) {
                setCount(count + 1)
                playTrack(currentSong.items[count + 1].uri)
            } else {
                setCount(0)
                playTrack(currentSong.items[0].uri)
            }
        //     默认模式，当不为最后一首时播放下一首，最后一首则回到第一首播放
        }
    }
}, [player.currentTrackDuration, player.progress])
//这个player就是进度条
```
完成图（包括前面的播放暂停等等功能）：<br />
<img src="../public/suchImg/联想截图_20250709155414.png" alt="play" width="300px" />
<br />
专辑、歌单、艺人页的信息展示和歌词显示部分的原理和上面提到过的内容很雷同，就不专门列出来了，就是封装 Spotify API 到api目录，然后在组件中调用获取数据并铺到UI界面上
### 3.3 按标签搜索和按关键字搜索两种搜索模式
按标签搜索和按关键字搜索的主要实现方法与上面类似，都是封装 Spotify API 到api目录，然后在组件中调用获取数据并铺到UI界面上，但区别在于它的内容是变动的。<br />
按标签搜索会根据 <span style="color:red">通过使用默认、手动、路由这三个方式选中的标签</span> 进行即时数据更新数据:
```typescript
    const [searchParams] = useSearchParams()
const [showSmallKey, setShowSmallKey] = useState(false)
const [searchKey, setSearchKey] = useState(searchKeyDemo)
const [albumList, setAlbumList] = useAtom<any>(AlbumList)
const { t } = useTranslation()
const [currentKey, setCurrentKey] = useState('\'\'')
const [currentNumber, setCurrentNumber] = useState(0)
const location = useLocation()
const { data } = useAlbumList(currentKey === '推荐歌单' ? 'recommend' : currentKey, currentNumber)
useEffect(() => {
    if (currentNumber === 0) {
        setAlbumList(data)
    }
    else {
        if (data) {
            const updatedList = {
                ...albumList, // 复制原始对象的所有属性
                albums: {
                    ...albumList?.albums, // 复制albums对象的所有属性
                    items: [
                        ...albumList?.albums?.items, // 保留原有的items
                        ...data?.albums?.items, // 添加新的items
                    ],
                },
            }
            setAlbumList(updatedList)
        }
    }
}, [data, currentNumber])

useEffect(() => {
    const keyFromUrl = searchParams.get('key')
    if (keyFromUrl && searchKey.includes(keyFromUrl)) {
        setShowSmallKey(false)
        document.querySelectorAll('.button.active').forEach((el) => {
            el.classList.remove('active')
        })
        setCurrentNumber(0)
        setCurrentKey(keyFromUrl)
        const index = searchKey.findIndex(item => item === keyFromUrl)
        const buttons = document.querySelectorAll('.buttons>.button')
        if (buttons[index]) {
            buttons[index].classList.add('active')
        }
    }
    else {
        setCurrentNumber(0)
        setCurrentKey('\'\'')
    }
}, [location])
```
而按关键字搜索则是根据 <span style="color:red">输入框中的关键字</span> 进行即时数据更新数据：
```typescript
import { useFetchProfile } from '../../api/search'

const { data: fetchProfile } = useFetchProfile(searchParams.get('q'))
//输入框在输入关键字并回车后会进行跳转路由操作，跳转到关键字搜索页，并在路由上放置关键字，关键字搜索页根据这个关键字进行数据搜索
```
完成图：<br />标签搜索
<img src="../public/suchImg/联想截图_20250709160738.png" alt="play" width="300px" />
<br />关键字搜索
<img src="../public/suchImg/联想截图_20250709155550.png" alt="play" width="300px" />
<br />
MV视频播放部分的实现同样也很类似就不专门列出来了，其主要难点就是找到或者自己做提供视频的API接口，我的做法是在七牛云上存储视频，然后做个小后端提供API接口，至于前端部分怎么做，依旧是封装 视频 API 到api目录，然后将视频放到UI界面上。<br />
### 3.4 页面翻译
这部分我主要使用了 i18next 进行国际化处理，i18next 是一个强大的国际化框架，可以轻松地实现多语言支持。以下是我实现页面翻译的步骤：
首先，创建i18n.ts文件并在main.tsx文件中引入
```typescript
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'tr', 'zh-CN', 'zh-TW'],
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
    })

export default i18n
```
接着便是繁琐重复的铺数据过程：
```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
```
```html
 <h1>{t('发现')}</h1>
```
铺完数据后按照上面i8n文件中的路径创建locales，并仿照下面的格式在locales中创建不同语种的翻译文件：
```json
{
    "播放": "Play",
    "首歌": "Songs",
    "首页": "Home",
    "发现": "Explore"
}
```
最后便是切换语言
```typescript
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const {i18n} = useTranslation()
const [language, setLanguage] = useState<string>(i18n.language || 'en')

// 当语言状态改变时，更新 i18n 实例的语言
useEffect(() => {
    i18n.changeLanguage(language)
}, [language, i18n])
```
完成图：<br />
<img src="../public/suchImg/img_1.png" alt="play" width="300px" />
<br />
收藏功能的原理也很简单雷同不列出来，依旧是封装收藏API到api目录，然后组件调用，主要难点也与 MV 视频播放一样，需要去找或者自己制作收藏API，对于此，我的做法同样是像解决视频API那样，将收藏数据存储到 MongoDB Atlas 上，然后做个小后端自己提供收藏API。
## 4.测试与部署
&nbsp;&nbsp;在完成了音乐播放器的核心功能实现后，我在本地进行了全面的测试，确保所有功能都能正常运行，并且没有明显的bug。<br />
&nbsp;&nbsp;测试完毕确认无误后，我将前端项目部署到 Vercel 上，确保用户可以访问并使用这个音乐播放器。<br />
&nbsp;&nbsp;同时，我还将后端服务从本地部署到 Railway 上，确保 API 能够正常提供数据支持。<br />
## 5.遇到的难点
在开发的过程中，我遇到的问题不少，这里从中随机摘取两个说一下：
### 5.1 引入图片文件
在React项目中，特别是Vite环境下，静态资源引用需要先
```typescript
import qrCodeImg from "../../assets/img/下载.png"
```
才能使用
```html
<img src={qrCodeImg} />
```
直接写相对路径/绝对路径会找不到文件
### 5.2 样式异常
&nbsp;&nbsp;在开发过程中，如果使用路由跳转到新页面样式正常，但在刷新后样式却发生巨大变化，那很可能是因为该页面的部分样式涉及到上一个页面的css文件，而刷新时只加载该页面本身的css文件所导致的。<br />
&nbsp;&nbsp;这时候就需要检查一下被影响的样式，并将其放入该页面本身的css文件中。<br />
&nbsp;&nbsp;这里提一嘴，设计css文件时最好将style内容用只使用一次的id或class包裹起来，确保各个css文件样式的独立性
## 6.总结与反思
&nbsp;&nbsp;通过这个音乐播放器项目，我不仅巩固了自己的前端技能，还深入理解了音频处理的相关知识，进一步掌握了如何使用 React、TypeScript、Vite 等技术栈来构建现代化的 Web 应用。<br />
&nbsp;&nbsp;对如何使用 Jotai 进行原子化状态管理，使用 @tanstack/react-query 来优化数据获取和缓存，使用 axios 进行 HTTP 请求处理，以及使用 i18next 实现多语言国际化支持有了更加清晰的认识。<br />
&nbsp;&nbsp;此外，对于使用 mitt 作为事件总线来处理组件间通信，使用 react-router-dom 来处理应用内路由导航，以及使用 Vite 来提升开发效率也是更加的得心应手。<br />
&nbsp;&nbsp;总的来说，这个音乐播放器项目让我在实践中或学习或巩固了很多前端开发的知识和技能，也让我更加深入地理解了音频处理的相关知识。在未来的项目中，我将继续应用这些知识和技能，不断提升自己的前端开发能力。<br />
## 7.资源分享
- [在线Demo链接](https://musicplayernodejs-production.up.railway.app/login)
- [GitHub代码仓库](https://github.com/JayFilker/music-player)
- [Spotify API 文档](https://developer.spotify.com/documentation/web-api)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Vite 官方文档](https://vitejs.dev/guide/)
- [Jotai 官方文档](https://jotai.org/)
- [@tanstack/react-query 官方文档](https://tanstack.com/query/latest/docs/react/overview)
- [axios 官方文档](https://axios-http.com/docs/intro)
- [i18next 官方文档](https://www.i18next.com/)
- [mitt 官方文档]
- [react-router-dom 官方文档](https://reactrouter.com/en/main)
- [Vercel 官方文档](https://vercel.com/docs)
- [Railway 官方文档](https://docs.railway.app/)
- [MongoDB Atlas 官方文档](https://www.mongodb.com/docs/atlas/)
- [七牛云官方文档](https://developer.qiniu.com/)

