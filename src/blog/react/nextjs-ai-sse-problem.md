---
title: Nextjs 对接第三方 AI 接口使用及问题踩坑
pubDate: 2025-04-26
description: Next.js 对接第三方 AI 接口时的 SSE 流式数据传输问题及示例，跨域和数据缓冲的处理方案
tags:
  - next
---

背景是已有的 AI 服务，在使用 Next 对接对话接口时出现的一些问题，做一个简易复现及问题解决方法

如果是使用第三方包去对接 OpenAI 等厂商接口的，此文章大概率不适用。

文章中的问题大概率只在 Next 中存在，如果是常规的 CSR 项目不会存在此问题，此文章大概率不适用

> 文中的解决方法并不一定是最优解，如果 Next 有相关的属性可配置就更好了。

## Table of contents

## 搭建简易的 SSE 服务

为了更真实，搭建一个简单的 `express` 服务，以此来模拟真实开发。

做一个对话内容的 SSE 文本，直接去通义、deepseek 这些 AI 平台进行一次对话，拿一下流数据，都遵循 [EventSource](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource) 的标准格式，大差不差，如下所示是一个简化的 `RAGFlow` SSE 示例，这种好处是可以对后续功能，如 markdown 解析做准备，单纯的字符串模拟输出看不出展示效果

```txt
data:{"code": 0, "message": "", "data": {"answer": "<think>\n嗯，我需要了解Gulp在React组件"}

data:{"code": 0, "message": "", "data": {"answer": "<think>\n嗯，我需要了解Gulp在React组件库中的使用。首先，我知道Gulp是一个用于"}
```

> 不过不知道为什么 `RAGFlow` 选择每次拼接上次对话，而不是单独分块输出，这和大部分 AI 平台的 SSE 方式都不一样

node 服务的代码也很简单，没什么内容

```js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// 读取的就是从 AI 平台拿到的流响应数据，做成响应的数据示例使用
const txtPath = path.join(__dirname, "./chat-txt/ragflow.txt");
const buffer = fs.readFileSync(txtPath);

// 整理 txt 对话的内容方便发送
const content = buffer
  .toString()
  .split("\n")
  .map((item) => item.trim())
  .filter((item) => !!item);

app.post("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let i = 0;

  const timer = setInterval(() => {
    if (i < content.length) {
      res.write(`${content[i]}\n\n`);
      i++;
    } else {
      clearInterval(timer);
      res.end();
    }
  }, 100);

  req.on("close", () => {
    clearInterval(timer);
    res.end();
  });
});

app.listen(9999, () => {
  console.log(`SSE 服务已启动: http://localhost:9999`);
});
```

## 对接第三方接口服务

### 使用 fetch 调用

- 为啥不是 `EventSource` 呢？`EventSource` 只能调用 GET 请求，无法自定义请求头
- 反正简单看了一下国内的 AI，对话全是 POST 请求
- 用 `EventSource` 就是图省事，仅仅是实现功能，刻意规避一些潜在问题，从业务角度来说并不合适，最关键的是后端给你提供 GET 和配合做请求认证

> 可以使用 `@microsoft/fetch-event-source` 实现 POST 的 EventSource

#### 跨域问题及之后的踩坑

跨域问题是前端再常见不过的了，要是以为解决跨域就能正常调用接口，那就大错特错了。

这里就踩坑了，而且此问题**大概率只会在 next 中出现**。

```js
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // 以 /test 开头的请求，转发到服务地址
        source: "/test/:path*",
        destination: `http://localhost:9999/:path*`,
      },
    ];
  },
};
```

跨域问题解决后，我们来请求接口 `fetch("/test/stream", { method: "POST" })`，结果就会发现事情不对，node 服务设置每 100ms 间隔推送一次数据，而前端却在所有服务端将所有数据推送完成之后才看到了返回的值。

![image](https://jsonq.top/cdn-static/2025/04/25/202504252326353.gif)

这里用简易 Postman 测试对比一下，就可以发现问题所在了

![image](https://jsonq.top/cdn-static/2025/04/26/202504261113414.gif)

正常情况下，sse 推送是实时的，前端每 100ms 都可以接收到新的推送数据，但是在 Next 的代理下，会先将所有推送的数据进行缓冲，最后一次性接收，这显然不符合实时推送接收的情况下。

#### 如何解决 Next 对数据缓冲问题

这个目前不知道是否存在可配置属性，现有的解决方法如下：

使用 Next 的 Route Handler 进行接口中转，就是用 Next 写个接口来调用第三方的 SSE 接口，服务与服务之间是不存在跨域问题的，单独中转 SSE 接口，其它普通接口在跨域解决后可以正常调用。

#### 通过 Next 接口做中转

```js
// app/api/proxy.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const upstream = await fetch("http://localhost:9999/stream", {
    method: "POST",
    // 关闭 Next 的重定向，手动处理
    redirect: "manual",
    // see: https://github.com/nodejs/node/issues/46221
    // 仅仅是类型缺失，该属性可以正常工作
    duplex: "half",
  });

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body?.getReader();
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      ...Object.fromEntries(upstream.headers),
    },
    status: upstream.status,
  });
}
```

为了做差异对比，这里请求代理的第三方接口，和 Next 中转的第三方接口

```js
async function fetchProxyData() {
  fetch("/test/stream", { method: "POST" });
}

async function fetchNextAPIData() {
  fetch("/api/proxy", { method: "POST" });
}
```

![image](https://jsonq.top/cdn-static/2025/04/26/202504261325260.gif)

## 前端接收 SSE 数据

### 使用 fetch 请求 POST 方式的 SSE 并解析

- 使用 `response.body` 先获取原始二进制流 `ReadableStream`
- 将二进制流解析为文本字符串才能正常使用 `TextDecoderStream`
- 使用 `EventSourceParserStream` 来专门解析 SSE 文本，提取内容，不用自己专门去处理数据格式了。

大致思路就是这样，以下就是此思路的代码实现，不过没有处理边界情况。

```js
import { EventSourceParserStream } from "eventsource-parser/stream";

const response = await fetch("/api/proxy", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  // signal: abortController?.signal,  // 可以控制响应中断
});

const reader = response.body
  ?.pipeThrough(new TextDecoderStream())
  .pipeThrough(new EventSourceParserStream())
  .getReader();

while (true) {
  const ev = await reader?.read();
  if (ev) {
    const { done, value } = ev;
    if (done) {
      console.info("接收结束");
      resetAnswer();
      break;
    }
    try {
      const parseData = JSON.parse(value?.data || "");
      const messageData = parseData?.data;
      // 这里开始就是自己的业务逻辑了，根据自己后端返回的流数据格式进行处理
      // if (typeof messageData !== 'boolean') {
      //   console.info('chunk data:', messageData);
      // }
    } catch (e) {
      console.warn(e);
    }
  }
}
```

### 使用 fetch-event-source 请求 POST 方式的 SSE

这个相比原生 fetch 使用更简单，毕竟 `EventSource` 本身就很简单无脑。

但是相应的，出现的一些常见问题得自己去做处理，比如 [#91](https://github.com/Azure/fetch-event-source/issues/91) 遇到无法解决得问题只能用原生 fetch 实现。

而且这个库已经长期不维护了，所以虽然此库使用简单，但并不是特别推荐。

```js
import { fetchEventSource } from "@microsoft/fetch-event-source";

fetchEventSource("/api/proxy", {
  method: "POST",
  onmessage(ev) {
    try {
      const data = JSON.parse(ev.data);
      console.info("chunk data:", data);
    } catch (e) {
      console.warn(e);
    }
  },
});
```

## markdown 渲染

这里其实也不算有踩坑，就是一些第三方包得体积特别大，然后做了部分取舍。

- `react-markdown` 渲染 markdown 内容
- `github-markdown-css` 美化 markdown，github 风格的样式，你也可以不需要这个，自定义元素样式也行，只是工作量较大
- `remark-gfm` 解析表格、链接、删除线等语法

剩下就是一些扩展性的插件了，根据需要选择是否安装即可。

- `remark-math`
- `rehype-katex`
- `rehype-highlight` 代码解析/高亮
  - 没有选择 `react-syntax-highlighter`，包体积较大的问题是其中之一，不过这个可以优化，见 [light-build](https://github.com/react-syntax-highlighter/react-syntax-highlighter?tab=readme-ov-file#light-build)
  - `rehype-highlight` 只负责解析代码，代码高亮是额外的 css 文件，可以在 npm [highlight](https://www.npmjs.com/package/highlight.js?activeTab=code) 上找各种主题的 css 样式，体积非常小。

使用也非常简单，`react-markdown` 可以使用各种 remark、rehype 插件

```js
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

import "github-markdown-css";

import "./highlight.css"; // 从 highlight npm 上拷贝的代码高亮样式

<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkMath]}
  rehypePlugins={[rehypeKatex, rehypeHighlight]}
  components={components} // 自定义 html 元素的样式
/>;
```
