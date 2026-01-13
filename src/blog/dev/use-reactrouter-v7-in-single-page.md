---
title: react router v7(6.4+) 新 API 在单页应用中的使用
pubDate: 2026-01-11
description: 使用 react router v7 新特性 API 实现权限认证、懒加载等以及部分踩坑
tags:
  - 开发
  - react
---

与其说是 v7 的新 API，倒不如说是 v6.4+ 的，而且不涉及框架模式的用法，只有数据模式，列举常用的几个，着重讲 loader，因为这个 API 确实有用。网上好多文章讲 loader 的都太浅了，基本只是介绍了最基础的使用（数据预加载），没啥用。

如果需要比较全的基础入门文章，可以看 [掘金](https://juejin.cn/post/7573699930259849242) 这篇，我个人觉得介绍的还是比较全面的。

这些东西其实都可以在 react router 文档上找到，我也会尽量标注相关文档出处，但是文档写的好谁会来找教程呢。其实对比 `tanstack-router` 的官方文档来说，react router 文档已经很不错了，tsr 的文档更是稀碎，只能说比烂这一块，tsr 还是更胜一筹。

## Table of contents

## RouterProvider 的导入路径注意

这个不算知识点，就是一些 v7 中的小细节，在单页应用中，官方推荐从 `react-router/dom` 中导入 `RouterProvider`。相关文档: [RouterProvider](https://reactrouter.com/api/data-routers/RouterProvider)

![RouterProvider](https://jsonq.top/cdn-static/2025/10/22/202601092323046.png)

## loader 进行数据预加载和鉴权

### loader 数据预加载及获取

loader 会在每次页面加载前触发，**早于页面加载渲染**。比如以下代码的输出顺序是 `loader load` -> `page load`

```tsx
const router = createBrowserRouter([
  {
    path: "/",
    loader: async () => {
      console.log("loader load");
    },
    Component: () => {
      console.log("page load");
      return <div>Page</div>;
    },
  },
]);
```

因此 loader 可以进行数据提前请求，而 loader 返回的数据在某种程度上也可以当作全局状态来使用。

- 如果想要获取 loader 中的数据，可以使用 [`useLoaderData`](https://reactrouter.com/api/hooks/useLoaderData)，但仅限于和当前 loader 对应的 Component 组件中获取
- 如果需要在页面上重新执行 loader，可以使用 [`useRevalidator`](https://reactrouter.com/api/hooks/useRevalidator)

```tsx
const loader = async () => {
  const response = await fetch("xxx");
  const data = await response.json();
  return { data };
};

function App() {
  // typeof loader 标注返回的 ts 类型
  const { data } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  return (
    <div>
      {JSON.stringify(data)}
      <button onClick={revalidator.revalidate}>重新执行loader</button>
    </div>
  );
}
```

- 如果子路由想要获取父路由的 loader 数据
  - 将父路由的 router 配置项上添加唯一 id 标识 `{ id: "root", path: "/", Component: Layout, loader: () => {},... }`
  - 在子路由中，使用 [`useRouteLoaderData`](https://reactrouter.com/api/hooks/useRouteLoaderData) 通过父路由 id 获取其 loader 数据，即 `useRouteLoaderData("root")`

```tsx
const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    loader: async () => {
      return { currentUser: "张三" }
    },
    Component: Layout,
    children: [
      {
        path: "/dashboard",
        Component: () => {
          const { currentUser } = useRouteLoaderData("root");
          return (
            <>
              <h1>Page Dashboard</h1>
              <p>当前用户：{currentUser}</p>
            </>
          )
        };
      }
    ]
  }
])
```

### 异步 loader 造成的白屏问题

如果 loader 中有异步操作（比如请求数据返回结果慢），就会阻塞渲染，造成页面白屏，这种情况下使用 [`HydrateFallback`](https://reactrouter.com/start/framework/route-module#hydratefallback) 可以在请求期间添加 Loading 等效果

注意，如果存在嵌套路由，且父路由和子路由同时设置了异步 loader 和 `HydrateFallback`，那么 `HydrateFallback` 的显示会**以父路由为准**。

比如以下例子，虽然 layout 的 loader 3s 就结束了，但是直到子路由 dashboard 5s 的 loader 结束前，始终显示 layout 的 `HydrateFallback`

```tsx
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//  5s 过程中显示 `Root Loading.....`
export const router = createBrowserRouter([
  {
    path: "/",
    HydrateFallback: () => <h1>Root Loading.....</h1>,
    Component: PageLayout,
    loader: () => sleep(3000),
    children: [
      {
        path: "/dashboard",
        HydrateFallback: () => <h1>Dashboard Loading.....</h1>,
        loader: () => sleep(5000),
        Component: () => <h1>Page Dashboard</h1>,
      },
    ],
  },
]);

function PageLayout() {
  return (
    <>
      <h1>PageLayout</h1>
      <Outlet />
    </>
  );
}
```

### loader 错误处理

当 loader 请求或处理失败的时候，react router 会显示一个默认的错误页面（没错，react router 会把 loader 当作路由加载的一部分来执行，所以存在执行出错的情况），可以使用 `ErrorBoundary` 自定义错误页面，用 `useRouteError` 获取错误信息

和 `HydrateFallback` 一样，嵌套路由中，父路由和子路由同时存在 loader 和 `ErrorBoundary` 时，子路由出错会显示父路由的 `ErrorBoundary`

```tsx
const sleepError = (ms: number, errMsg: string) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(errMsg)), ms));

// 页面经过 5s 后最终显示 `Root Loader Error`
export const router = createBrowserRouter([
  {
    path: "/",
    HydrateFallback: () => <h1>Root Loading.....</h1>,
    Component: PageLayout,
    loader: () => sleepError(3000, "Root Loader Error"),
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        path: "/dashboard",
        HydrateFallback: () => <h1>Dashboard Loading.....</h1>,
        loader: () => sleepError(5000, "Dashboard Loader Error"),
        ErrorBoundary: RouteErrorBoundary,
        Component: () => <h1>Page Dashboard</h1>,
      },
    ],
  },
]);

function PageLayout() {
  return (
    <>
      <h1>PageLayout</h1>
      <Outlet />
    </>
  );
}

function RouteErrorBoundary() {
  const error = useRouteError() as Error;

  return <h1>{error.message}</h1>;
}
```

### 使用 loader 进行权限认证

react router v7 提供了 [`redirect`](https://reactrouter.com/api/utils/redirect) API，可以更方便的进行路由跳转。

以前跳转方式都是使用 `useNavigate` 或者 `Navigate` 组件，但是 `useNavigate` 只能在组件中使用，`Navigate` 现在官方也不是很推荐使用，详情见 [Navigate](https://reactrouter.com/api/components/Navigate) 说明

目前鉴权有两种常见实现方式：

1. 只在 loader 中判断 token 等是否存在，不存在，跳转 login 页面，存在，进入目标页面，在请求数据时若 token 过期再提示用户返回 login 页面
2. 在 loader 直接请求用户信息，请求成功才进入认证页面，否则跳转 login 页面，在请求期间使用 `HydrateFallback` 只挂起 Loading 组件

这里以第 2 种为例

```tsx
async function authLoader() {
  // 在进入认证路由前，校验此用户 token 状态
  if (!localStorage.getItem("token")) return redirect("/login");

  try {
    const { code, data } = await mockFetchUserInfo();
    if (code !== 200) return redirect("/login");
    // loader 可通过 useLoaderData 或 useRouteLoaderData(id) 获取
    return { currentUserInfo: data };
  } catch {
    return redirect("/login");
  }
}

export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    HydrateFallback: () => <h1>Root Loader Loading.....</h1>,
    Component: PageLayout,
    loader: authLoader,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        index: true,
        Component: () => <div>Page Home. Protected Route</div>,
      },
      {
        path: "/dashboard",
        Component: () => <h1>Page Dashboard</h1>,
      },
    ],
  },
  {
    path: "/login",
    Component: () => <h1>Page Login</h1>,
  },
]);

// 模拟请求
function mockFetchUserInfo() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const randomSuccess = Math.random() > 0.5;
      if (randomSuccess) {
        resolve({ code: 200, data: { name: "张三" }, message: "success" });
      } else {
        reject({ code: 500, data: null, message: "fail" });
      }
    }, 3000);
  });
}

function RouteErrorBoundary() {
  const error = useRouteError() as Error;
  return <h1>{error.message}</h1>;
}

function PageLayout() {
  return (
    <>
      <h1>PageLayout</h1>
      <Outlet />
    </>
  );
}
```

以上代码中，由于受保护的根路由以 `/` 开头，因此初次访问任何页面都会触发根路由的 `loader`，而 `/login` 页面不受 `authLoader` 控制，因此在访问 login 页面时是不会触发权限校验的。

嵌套路由的情况下，如果某个子路由想直接使用父路由的 path，就可以使用 `index: true`进行配置，这样当访问到父路由时，会直接匹配到子路由的页面。就像以上代码中，当校验通过时，访问 `localhost:3000` 显示的就是 Layout 布局嵌套的 Home 页面。对应官方文档 [Index Routes](https://reactrouter.com/start/data/routing#index-routes)

## 路由懒加载

react router v7 中，可以不用再使用 `React.lazy` 来懒加载路由，官方内置了写法，使用 [`lazy`](https://reactrouter.com/start/data/route-object#lazy)。

以前我们使用 lazy 大概就是如下代码：

```tsx
const route = {
  path: "dashboard",
  lazy: () => import("./dashboard"),
};

// or
const route = {
  path: "dashboard",
  element: React.lazy(() => import("./dashboard")),
};
```

现在的 lazy，可以让你同时返回 `RouteObject` 配置项的形式，让 loader action Component 等都可懒加载

> 如果使用 `lazy` 进行懒加载，就必须搭配 `HydrateFallback`，不然会有警告，大家可自行尝试

```tsx
export const router = createBrowserRouter([
  {
    path: "/",
    HydrateFallback: () => <h1>Root Loading.....</h1>,
    lazy: async () => {
      const { default: Component } = await import("../layouts");
      return { Component };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component, clientLoader: loader } = await import(
            "../pages/home"
          );
          return { Component, loader };
        },
      },
      {
        path: "/dashboard",
        lazy: async () => {
          const { default: Component } = await import("../pages/dashboard");
          return { Component };
        },
      },
    ],
  },
  {
    path: "*",
    lazy: async () => {
      const { default: Component } = await import("../pages/404");
      return { Component };
    },
  },
]);
```

### 简化懒加载写法

如果觉得每次写 lazy 解构和返回配置项比较麻烦，可以封装一个函数来处理懒加载，当然这个写法也来源于官方文档 [RouteProvider create a convert function](https://reactrouter.com/upgrading/router-provider)，没有明显标注，我也是偶然间看到的

```ts
function convert(m: any) {
  let { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader,
    action: clientAction,
    Component,
  };
}
```

这种其实就相当于**约定式**写法，你的路由入口文件需要遵循 `default` 导出路由组件，`clientLoader` 导出 loader，`clientAction` 导出 action 等等。

例如在这种约定式写法下的 Home 组件

```tsx
// pages/home.tsx
export const clientLoader = async () => {
  console.log("clientLoader");
};

export const clientAction = async () => {
  console.log("clientAction");
};

export default function Home() {
  return <div>Home</div>;
}
```

在 route 路由表中使用时，效果如下：

```tsx
// router.ts
import { convert } from "./convert";

export const router = createBrowserRouter([
  {
    path: "/",
    HydrateFallback: () => <h1>Root Loading.....</h1>,
    lazy: import("../layouts").then(convert),
    children: [
      {
        index: true,
        lazy: import("../pages/home").then(convert),
      },
      {
        path: "/dashboard",
        lazy: import("../pages/dashboard").then(convert),
      },
    ],
  },
]);
```

## 路由懒加载的 fallback 显示

注意，`HydrateFallback` 只是 loader 的 fallback，而无法处理懒加载路由的 fallback，尝试了添加 `Suspense` 来处理新写法下懒加载路由的 fallback，但是不生效。

后来在官网找到了 [`useNavigation`](https://reactrouter.com/api/hooks/useNavigation) 这个 hook，可以获取当前路由的状态，再结合官网 [Pending UI](http://reactrouter.com/start/framework/pending-ui) 的示例才算是解决了。

```tsx
function PageLayout() {
  const navigation = useNavigation();

  return navigation.state === "loading" ? <div>Loading...</div> : <Outlet />;
}
```

如果路由是初次加载，那么 `state` 就会从 `loading` 开始，加载完变为 `idle`，再次切换回来也始终是 `idle`。

> 但是总觉得这个方式不是很好，不过官网这么写的，就先这么用吧。

## handle 类似 vue router 的 meta 属性

事先声明，我不知道这个是否是 v6.4 之后新增的，只是最近突然发现有这么一个属性，这样就不用对 react router 做过多的扩展性配置了，比较方便。

比如在 handle 中标识权限来控制用户是否能访问，是否在菜单中显示等等，可以使用 `useMatches` 来获取当前页面的路由组，其中就包含了 handle 属性。

```tsx
const route = {
  path: "/dashboard",
  handle: { auth: ["admin"] },
  lazy: import("../pages/dashboard").then(convert),
};

// pages/dashboard.tsx
export default function Dashboard() {
  const matches = useMatches();
  const routeMatch = matches[matches.length - 1];

  /**
   {
    id: "xxx",
    pathname: "/dashboard",
    params: {},
    handle: {
      auth: ["admin"],
    },
  }
   */
  console.log(routeMatch);

  return (
    <div>
      <h1>Dashboard</h1>
      {/* 用户为 admin 角色才有 button 权限 */}
      {routeMatch.handle.auth.includes(currentUserInfo.role) && (
        <button>Click me</button>
      )}
    </div>
  );
}
```

其实在正常开发场景下，handle 的扩展内容一般会结合 loader 来做页面级别的权限认证，比如以下代码，我们可以根据 loader 拿到的数据和 handle 的权限信息来控制显示内容

```tsx
// RouteProtect.tsx
export default function RouteProtect(props: RouteProtectProps) {
  const { children } = props;
  // https://reactrouter.com/api/hooks/useRouteLoaderData#summary
  const rootLoaderData = useRouteLoaderData<typeof authLoader>("root");
  const matches = useMatches();

  // 如果在 loader 中做了认证失败的跳转，那理论上永远不会走这个，因为 loaderData 请求成功才会进入 RouteProtect
  if (!rootLoaderData) return null;

  const routeAuth = matches[matches.length - 1].handle?.auth;

  // 没有权限限制，直接展示
  if (!routeAuth || routeAuth.length === 0) return children;

  // 检查当前人是否有当前路由的权限
  // eg: userRole: ["admin"] routeAuth: ["admin","user"]
  const userRole = rootLoaderData.currentUserInfo.role;
  if (routeAuth.some((auth) => userRole.includes(auth))) {
    return children;
  }

  return <h1>您没有权限访问此页面</h1>;
}
```

这里以后台管理系统为例使用 `RouteProtect`

```tsx
export default function PageLayout() {
  return (
    <Layout>
      <Sider>
        <Menu />
      </Sider>
      <Layout>
        <Header />
        <Content>
          {/* 对页面进行权限保护 */}
          <RouteProtect>
            <Outlet />
          </RouteProtect>
        </Content>
      </Layout>
    </Layout>
  );
}
```

## 结语

这篇文章也算是最近对 react router 使用的一个小结，网上文章和官方文档也看了一些，在单页应用中的使用体验上确实比 v6 要好不少，但是文档太烂了，也算是对最近被 react router 折磨的一个记录。
