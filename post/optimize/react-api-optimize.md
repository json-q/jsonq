---
title: react API层性能优化
date: 2024-05-28
---

react 无法做到像 vue 一样自动收集依赖更新（期待 react19 的 React Compiler），需要开发人员手动的进行性能优化，此时 `memo`、`useCallback`、`useMemo`、`useRef` 就是性能优化中的重要 API

> 本文虽然介绍可应用场景，但是正常开发中，尤其是 `useCallback`。除非遇到性能问题或者组件封装，亦或是能力足够，否则不建议轻易各处使用 `useCallback`，迭代过程中滥用的话，很可能出现屎山，甚至导致问题难以排查

# memo

正常情况下，父组件发生变化时，就算变化的 state 与子组件无关，但还是会导致子组件 rerender。这种情况下，可以使用 `memo` 包裹子组件

`memo` 的作用：被 memo 包裹的组件，会自动对 props 进行浅比较，若传入的 props 没有改变，则不会重新 render

## 简单场景

代码示例：

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688016-h2tuhwqc.png)

效果图：

![image](https://jsonq.top/cdn-static/2025/02/25/1740476995624-l09dxd1q.gif)

图中可以看到，虽然 `Child` 子组件的 name 没有发生任何变化，但是由于父组件的 state 改变导致整个组件重新渲染，子组件也无法避免 rerender（第一个打印是初始加载时的渲染）

## 解决方法

给子组件进行 `memo` 包裹，使其只有 props 相关发生改变时才重渲染

代码示例：

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688157-nhrorb9e.png)

效果图：

![image](https://jsonq.top/cdn-static/2025/02/25/1740476995743-5hh6l5q0.gif)

子组件 `memo` 后，props 只要不发生变化就不会重渲染

## 引用数据类型的 props 导致重渲染

以上示例中，我们给子组件传入的 `name` 是基本数据类型，如果传入一个 obj 复杂数据类型，虽然值没发生变化，但是子组件依旧发生了重渲染

```js
<Child name="张三" obj={{ a: 1 }} />
```

效果图：

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688245-m8lve545.gif)

图中结合代码可见，`obj` 是传入的不变值，看似 props 是没有发生变化的。但是：**`obj` 是引用数据类型，其数据是存到堆内存中的，和基本类型不同**，`state` 每发生一次变化，`obj` 的内存地址就会重新变动，生成的是一个全新的 `obj` 对象，这就导致了表面上看似 props 没变化，实际上是 `obj` 是一直在变，一直在 rerender

### 解决方法一：数据提取至外部（推荐，最简单）

将静态不变的数据提取到组件外，组件重渲染时，由于对象是在组件外的，不会触发更新，若数据依赖了 state 等组件内数据，推荐第三种解决方法

```js
const obj = {
  a: 1,
};

function App() {
  return (
    // ....
    <Child name="张三" obj={obj} />
  );
}
```

### 解决方法二：useMemo（不推荐）

使用 `useMemo` 缓存，和 `useEffect` 用法相似，不过第一个函数需要返回数据，第二个参数是依赖，空数组就是仅初始化执行，但是 `useMemo` 大部分是用于计算缓存的，纯静态值不推荐

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688359-ug8x9vxv.png)

```js
<Child
  name="张三"
  obj={useMemo(() => {
    return {
      a: 1,
    };
  }, [])}
/>
```

### 解决方法三：memo 手动深度对比（推荐）

memo 有第二个参数，是一个函数，函数第一个参数是更新前的 props，第二个参数是更新后的 props，可以自行对比，返回 true 不更新，返回 false 说明两次 props 不一致，更新。

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688445-khbicxq5.png)

深度对比的第三方库很多，此处以 `fast-deep-equal` 为例

```js
// 父组件不变
<Child name="张三" obj={{ a: 1 }} />;

// 子组件 memo 参数深度比较
import isDeep from "fast-deep-equal";

const Child: React.FC<ChildProps> = memo((props) => {
  // ....
}, isDeep);
```

# useMemo

`useMemo` 通常用来缓存不常变动的大量的逻辑计算结果，就像上文中，使用 `useMemo` 缓存了 obj 对象，其实就可以把 obj 当作很复杂的处理后的一个结果，但是静态数据提取至外部更简单。可以把 `useMemo` 理解为 vue 中的 `computed` 计算属性

## 简单场景

示例代码：

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688529-3bbzit8e.png)

当我更改时间戳时，`computedCount` 跟 `timestamp` 半毛钱关系没有，但依旧每次都会重新执行 `computedCount` 函数，每次执行函数的计算花费 50-60 毫秒不等，如果计算内容再复杂一点，每次都会产生大量无用开支

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688682-t71n95ix.gif)

## 解决方法

使用 `useMemo` 进行计算结果缓存。

代码示例：

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688784-6ui29nns.png)

效果图：

![image](https://jsonq.top/cdn-static/2025/02/25/1740476995829-8p69rv5d.gif)

# useCallback

当父组件给子组件传递函数时，父组件状态更改，会导致子组件 rerender

## 简单场景

代码示例：

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688881-sh04f07a.png)

更改父组件的 `timestamp`，其中 `getList` 函数跟 `timestamp` 半毛钱关系没有，就算子组件加了 `memo` 和 深对比，也无法阻止 rerender

![image](https://jsonq.top/cdn-static/2025/02/25/1740465688977-h8f6fq7y.gif)

**原因：**

- 函数无法进行对比，总不能 `JSON.stringify` 对比代码内容吧。
- `timestamp` 更改，导致组件重新渲染，`getList` 函数的内存地址重新创建，memo 无法对比，所以重新 rerender

## 解决方法

使用 `useCallback` 缓存 `getList` 函数 <strong style="color:red;">不要依赖项无脑写空，如果函数内部用到了某个 state，必须写入依赖项，否则拿不到最新值</strong>

代码示例：

![image](https://jsonq.top/cdn-static/2025/02/25/1740465689120-l54rsibg.png)

效果图：

![image](https://jsonq.top/cdn-static/2025/02/25/1740476995960-cebv5f8i.gif)

# useRef

`useRef` 第一认知是用于获取 dom 元素，但 `useRef`也具有记忆功能， 可以用来进行变量记录。和 `useState` 不同的区别是：

- `useRef` 记录的变量更改时是不会刷新视图的，也就是非响应式数据。

既然是非响应式，那和常量的区别是：

- 常量在组件内容，若 state 更改导致组件 rerender，会使组件内的常量重置，而 `useRef` 记忆的不会

何时使用 `useRef` 而不是 `useState`？这是 react 中文网对 `useRef` 的描述

![image](https://jsonq.top/cdn-static/2025/02/25/1740465689224-sh3l1b7z.png)

当一个数据不需要展示到页面上，仅仅作为一个记录值，比如分页数据。请求后端数据时，页码和分页尺寸通常是不会显示到页面上的（纯受控分页除外），当页码改变，去请求后端数据

> 开发过程中，页码和页数使用 `useRef` 是非常常见的方式，不显示到视图的数据优先用 `useRef`，不仅使用比 `useEffect` 方便 ，且可以减少 rerender

## 使用 useState 的效果

![image](https://jsonq.top/cdn-static/2025/02/25/1740465689356-k6taeudx.png)

![image](https://jsonq.top/cdn-static/2025/02/25/1740476996069-evstla4a.gif)

这种写法，由于 `setState` 为异步，需要在 `useEffect` 中拿到页码改变后的最新值并请求（也可以有其它方式，暂不赘述），而且**每次页码 +1，都会导致组件 rerender，这也是一部分无用的性能开销，重要的是 rerender**

## 使用 useRef 的效果

`useRef` 最重要的就是**不会导致组件 reredner**

![image](https://jsonq.top/cdn-static/2025/02/25/1740465689486-wfzytqao.png)

![image](https://jsonq.top/cdn-static/2025/02/25/1740476996148-ggmav6yd.gif)

记录了页码的变动，也没有导致组件的 rerender

# 使用场景总结

- memo
  - 子组件接收了父组件的 props，**通常可以向子组件添加 `memo`**，props 不变化，就会复用上一次的渲染
- useMemo
  - 当出现**复杂大量的计算结果**直接显示到视图上时，通常需要使用 `useMemo` 进行计算结果缓存，小量的计算结果没必要，因为缓存本身是需要消耗性能的，普通计算若缓存，可能缓存本身都比计算的性能开支高
- useCallback
  - 主要应用于 **父组件的函数传递给子组件** 的情况下，该函数可以使用 `useCallback` 缓存，同时 `useCallback` 也可以解决 react 闭包问题，当然这个不是本篇的重点讨论范围
  - 对于 `useCallback` 的看法就是，需要在合适的场景使用，滥用不可取，很可能会本末倒置，若使用不熟练，大概率会造成一系列问题。
- useRef
  - 通常用于数据的更改记录，这些**数据往往都不会参与视图的渲染**，仅仅是代码内部消化的一些数据，这些数据使用 `useRef` 往往可以减少组件的 rerender

> 除 `useRef` 外，`memo` `useMemo` `useCallback` 都需要考虑到缓存开销，过分的滥用优化可能适得其反，其中，`useCallback` 需格外注意其使用场景和使用方式，避免造成不可维护代码
