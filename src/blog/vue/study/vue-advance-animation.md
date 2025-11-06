---
title: Vue 高级特性及过渡动画
pubDate: 2023-06-18
description: Vue高级特性，自定义指令、Teleport、异步组件、插件及过渡动画的使用方法
tags:
  - vue
---

## Table of contents

## 自定义指令

类似 `v-for`、`v-show` 等指令，当标签上写入 `v-xxx` 时，希望执行某种功能，官方提供了可以自定义的指令操作。

例如：`<input/>` 使用 `v-focus` 指令，可以自动获取输入框焦点

### 局部自定义指令

![局部自定义指令](https://jsonq.top/cdn-static/2025/02/25/1740465694618-z38xrcnq.jpg)

> 在 选项式 API 中， v-xxx 的 xxx 对应的是 directives 中的 key
>
> 在 setup 中，自定义指令**必须以 v 开头**，vFa 对应的自定义指令就是 `v-fa`

### 全局自定义指令

全局自定义指令需应用于 main.js 中

```js
app.directive("focus", {
  mounted(el) {
    console.log("el", el);
    el?.focus();
  },
});
```

当自定义指令过多时，会导致 main.js 中的挂载非常多，为了更易于，可以将其抽离出去

![自定义指令抽离](https://jsonq.top/cdn-static/2025/02/25/1740465694728-enm0e8ma.jpg)

### 自定义指令生命周期

| 生命周期      | 描述                                                 |
| ------------- | ---------------------------------------------------- |
| created       | 在绑定元素的 attribute 或事件监听器被应用之前调用    |
| beforeMount   | 当指令第一次绑定到元素并且在挂载父组件之前调用       |
| mounted       | 在绑定元素的父组件被挂载后调用                       |
| beforeUpdate  | 在更新包含组件的 VNode 之前调用                      |
| updated       | 在包含组件的 VNode **及其子组件的 VNode** 更新后调用 |
| beforeUnmount | 在卸载绑定元素的父组件之前调用                       |
| unmounted     | 当指令与元素解除绑定且父组件已卸载时，只调用一次     |

### 指令的参数和修饰符

![指令的参数和修饰符](https://jsonq.top/cdn-static/2025/02/25/1740465694843-59upf1ni.jpg)

## Teleport

在组件化开发中，我们封装一个组件 A，在另外一个组件 B 中使用：

- 那么组件 A 中 template 的元素，会被挂载到组件 B 中 template 的某个位置；
- 最终我们的应用程序会形成一颗 DOM 树结构；但是某些情况下，我们希望组件不是挂载在这个组件树上的，可能是移动到 Vue app 之外的其他位置：
  - 比如移动到 body 元素上，或者我们有其他的 div#app 之外的元素上；
  - 这个时候我们就可以通过 teleport 来完成；

**总的来说就是挂载到 `#app` 之外的地方，可以使用 `teleport`**

Teleport 是一个 Vue 提供的内置组件，类似于 react 的 `Portals`

- 两个属性：
  - to：指定将其中的内容移动到的目标元素，可以使用选择器
  - disabled：是否禁用 teleport 的功能

> 当在 `<teleport>` 标签上使用 disabled 时，`<teleport>` 的功能就会失效，相当于 `<templete>`
>
> 当多个 `<teleport>` 的 to 属性都指向一个节点时，多个 `<teleport>` 内部的元素内容会进行合并

## 异步组件和 Suspense

和 react 的 Suspense 比较类似，当一个组件未挂载时，显示其它内容（比如 loading）进行展示。

- Suspense 是一个内置的全局组件，该组件有两个插槽：
  - default：如果 default 可以显示，那么显示 default 的内容
  - fallback：如果 default 无法显示，那么会显示 fallback 插槽的内容

```html
<Suspense>
  <templete #default>
    <AsyncApp />
  </templete>
  <templete #fallback>
    <Loading />
  </templete>
</Suspense>
```

> `<Suspense>` 在 vue 中是一项实验性功能。它不一定会最终成为稳定功能，并且在稳定之前相关 API 也可能会发生变化。

## 插件

```js
// 对象类型写法
app.use({
  name: "plugin1",
  install(app, option) {
    console.log("插件被安装", app);
  },
});

// 函数写法
app.use(function direactives(app, option) {
  console.log("插件被安装", app);
});
```

> 对象类型：一个对象，但是必须包含一个 `install` 的函数，该函数会在安装插件时执行；  
> 函数类型：一个 function，这个函数会在安装插件时**自动执行**  
> 执行的内部会自动传入两个参数 app 和 option

## Vue 使用 jsx 语法

- 如果希望在项目中使用 jsx，即 react 的 jsx 语法，那么需要添加对 jsx 的支持：
  - jsx 我们通常会通过 Babel 来进行转换（React 编写的 jsx 就是通过 babel 转换的）；
  - 对于 Vue 来说，只需要在 Babel 中配置对应的插件即可；
- 安装 Babel 支持 Vue 的 jsx 插件：
- 在 `babel.config.js` 配置文件中配置插件：

  ```bash
  npm install @vue/babel-plugin-jsx -D
  ```

  如果是 `Vite` 环境，需要安装插件：

  ```bash
  npm install @vitejs/plugin-vue-jsx -D
  ```

案例：

```js
export default {
    setup(){
        const counter = ref(0)
        const minus =()=> counter--
        const add = () => counter++

        return {
            counter,
            minus,
            add
        }
    }

    render(){
        return (
            <div>
                <div>当前计数： {{ this.counter }}</div>
                <button onClick={this.add}>+1</button>
                <button onClick={this.minus}>+1</button>
            </div>
        )
    }
}

```

## 过渡动画

React 框架本身并没有提供任何动画相关的 API，所以在 React 中使用过渡动画我们需要使用一个第三方库 `react-transition-group`  
Vue 中为我们提供一些内置组件和对应的 API 来完成动画，利用它们我们可以方便的实现过渡动画效果

- v-enter-from：定义进入过渡的开始状态。
  - 在元素被插入之前生效，在元素被插入之后的下一帧移除。
- v-enter-active：定义进入过渡生效时的状态。 - 在整个进入过渡的阶段中应用，在元素被插入之前生效，在过渡/动画完成之后移除。这个类可以被用来定义进入过渡的过程时间，延迟和曲线函数。
- v-enter-to：定义进入过渡的结束状态。
  - 在元素被插入之后下一帧生效 (与此同时 v-enter-from 被移除)，在过渡/动画完成之后移除。
- v-leave-from：定义离开过渡的开始状态。
  - 在离开过渡被触发时立刻生效，下一帧被移除。
- v-leave-active：定义离开过渡生效时的状态。 - 在整个离开过渡的阶段中应用，在离开过渡被触发时立刻生效，在过渡/动画完成之后移除。这个类可以被用来定义离开过渡的过程时间，延迟和曲线函数。
- v-leave-to：离开过渡的结束状态。
  - 在离开过渡被触发之后下一帧生效 (与此同时 v-leave-from 被删除)，在过渡/动画完成之后移除。

class 的 name 命名规则如下：

- 如果我们使用的是一个没有 name 的 transition，那么所有的 class 是以 v- 作为默认前缀；
- 如果我们添加了一个 name 属性，比如 `<transtion name="my">`，那么所有的 class 会以 my- 开头

### transition

```html
<template>
  <div class="animation">
    <button @click="isShow = !isShow">切换</button>
    <transition name="my">
      <h2 v-if="isShow">How old are you?</h2>
    </transition>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  const isShow = ref(false);
</script>

<style>
  /* 开始进入时的状态 */
  /* 离开完成时的状态 */
  .my-enter-from,
  .my-leave-to {
    opacity: 0;
  }

  /* 进入过程需要执行的操作 */
  /* 离开过程需要执行的操作 */
  .my-enter-active,
  .my-leave-active {
    transition: all 2s ease;
  }

  /* 进入完成时的状态 */
  /* 开始离开时的状态 */
  .my-enter-to,
  .my-leave-from {
    opacity: 1;
  }
</style>
```

整个动画流程状态如图所示：

![动画状态](https://jsonq.top/cdn-static/2025/02/25/1740465694950-gy7ev10x.jpg)

**appear：初次渲染** 给 `<transition/>` 属性添加 apper 属性，可以实现首次渲染时的动画效果

**mode：过渡的模式** 当动画在两个元素之间切换的时候存在的问题一个问题：

- 两个元素的切换是同时执行的
- 这是因为默认情况下**进入和离开动画**是同时发生的

- `mode="in-out"`：新元素先进行过渡进入，完成之后当前元素过渡离开
- `mode="out-in"`：当前元素先进行过渡离开，完成之后新元素过渡进入

**duration：显示的指定动画时间**

- number 类型：同时设置进入和离开的过渡时间 `:duration:"1000"`
- object 类型：分别设置进入和离开的过渡时间 `:duration:{enter: 800, leave: 1000}`

### transition-group

一组动画的实现，比如列表的添加与删除

- 默认情况下，它不会渲染一个元素的包裹器，但可以通过 tag 属性指定某个元素进行渲染，例如 `<transition-group tag="div" />` 就会被渲染成 div
- **过渡模式不可用**，因为我们不再相互切换特有的元素；
- 内部元素必须提供**唯一的 key** 值；
- CSS 过渡的类将会**应用在内部的元素**中，而不是这个组/容器本身；

- 当列表添加和删除元素时，虽然被操作元素拥有动画，但其它的元素都是直接移动的，若想要给移动的元素添加动画，可以在写 css 时使用 `xxx-move`，同时可以与应用于打乱元素时，自动执行动画
- `xxx-move` 在元素添加进入时有动画效果，但在元素移除时，动画效果丢失，可以添加 `xxx-leve-active{ position: absolute; }`，使其在其它元素移除时移动也有动画效果

```html
<template>
  <div class="app.vue">
    <h2>App.vue</h2>
    <button @click="add">添加</button>
    <TransitionGroup tag="div" name="my">
      <template v-for="(item, index) in nums" :key="item">
        <div>{{ item }} <button @click="remove(index)">删除</button></div>
      </template>
    </TransitionGroup>
  </div>
</template>

<script setup>
  import { reactive } from "vue";
  const nums = reactive([1, 2, 3, 4, 5]);

  const add = () => nums.push(nums.length + 1);
  const remove = (index) => nums.splice(index, 1);
</script>

<style>
  /* 开始进入时的状态 */
  /* 离开完成时的状态 */
  .my-enter-from,
  .my-leave-to {
    opacity: 0;
  }

  /* 进入过程需要执行的操作 */
  /* 离开过程需要执行的操作 */
  .my-enter-active,
  .my-leave-active {
    transition: all 2s ease;
  }

  /* 解决元素移除时移动无动画的问题 */
  .my-leave-active {
    position: absolute;
  }

  /* 进入完成时的状态 */
  /* 开始离开时的状态 */
  .my-enter-to,
  .my-leave-from {
    opacity: 1;
  }

  .my-move {
    transition: all 2s ease;
  }
</style>
```

## Vue2、Vue3 响应式原理

### 响应式依赖收集

收集函数主动调用

```js
const obj = {
  name: "张三",
  age: 20,
};

const reactiveFns = [];

// 设置一个专门执行响应式函数的 fn
function watchFn(fn) {
  reactiveFns.push(fn);
}

watchFn(function foo() {
  console.log("foo", obj);
});

watchFn(function bar() {
  console.log("bar", obj);
});

obj.name = "李四";
reactiveFns.forEach((fn) => {
  fn();
});
```

### 类格式收集

设置单独的类专门管理收集的依赖

```js
class Depend {
  constructor() {
    this.reactiveFns = [];
  }
  // 添加到收集数组中
  addDepend(fn) {
    if (fn) {
      this.reactiveFns.push(fn);
    }
  }

  notify() {
    this.reactiveFns.forEach((fn) => {
      fn();
    });
  }
}

const obj = {
  name: "张三",
  age: 20,
};

const dep = new Depend();

// 设置一个专门执行响应式函数的 fn
function watchFn(fn) {
  dep.addDepend(fn);
}

watchFn(function foo() {
  console.log("foo", obj);
});

watchFn(function bar() {
  console.log("bar", obj);
});

obj.name = "李四";
dep.notify();
```

### 监听属性变化

主动通知过于繁琐，需手动调用。  
需求：当属性变化时进行劫持自动通知

**vue2 Object.defineProperty 监听**

```js
const obj = {
  name: "张三",
  age: 20,
};

const dep = new Depend();

// 对属性的 key 进行遍历绑定
Object.keys(obj).forEach((key) => {
  let val = obj[key]; // 属性值
  Object.defineProperty(obj, key, {
    set: function (newV) {
      console.log(`${key}发生改变`, newV);
      val = newV;
      dep.notify(); // 收集函数通知调用
    },
    get: function () {
      return val;
    },
  });
});

// 设置一个专门执行响应式函数的 fn
function watchFn(fn) {
  dep.addDepend(fn);
}

watchFn(function foo() {
  console.log("foo name", obj.name);
  console.log("foo age", obj.age);
});

watchFn(function bar() {
  console.log("bar name", obj.name);
  console.log("bar age", obj.age);
});

obj.name = "李四";
```

### 自动收集依赖

当 name 发生改变时，此时 foo 和 bar 都会被调用，甚至与 obj 无关的函数都会调用，但是 bar 内部没有关于 name 的依赖。  
原因：dep 收集依赖无法区分，只能传入的函数全部调用  
需求：只调用与数据变化有关依赖的函数

```js
watchFn(function foo() {
  console.log("foo name", obj.name);
  console.log("foo age", obj.age);
});

// bar 函数内部没有使用 name，却也调用了
watchFn(function bar() {
  console.log("bar age", obj.age);
});

obj.name = "李四";
```

思路：

- 要给每个 obj 的**属性绑定依赖**，而**不是给 obj 对象本身绑定依赖**
- 怎么才能给使用的属性绑定依赖，而未使用的就绑定呢？
  - 当使用经过 `Object.defineProperty` 修饰的对象时，内部会进行劫持，触发 get 函数，可以在 get 中进行一些操作
  - 比如拿到该对象，拿到该对象需要访问的属性

在 [监听属性变化](#监听属性变化) 这一步，实现的流程大致如下：

![监听属性变化流程思路](https://jsonq.top/cdn-static/2025/02/25/1740465695042-w2wsivut.jpg)

通过 Map 对象进行多重 map 映射，就可以很轻松的获取到数对象的 属性 对应的 dep 对象

![map映射](https://jsonq.top/cdn-static/2025/02/25/1740465695145-mhm3u61e.jpg)

```js
class Depend {
  constructor() {
    this.reactiveFns = [];
  }
  // 添加到收集数组中
  addDepend(fn) {
    if (fn) {
      this.reactiveFns.push(fn);
    }
  }

  notify() {
    this.reactiveFns.forEach((fn) => {
      fn();
    });
  }
}

const user = {
  name: "张三",
  age: 20,
};

/**-------------------------------------------重点 start--------------------------- */
// 封装一个函数：负责通过 obj 获取对应的 depend 对象
const allMap = new WeakMap();
function getDeped(obj, key) {
  // 1、根据对象obj，找到对应的 Map 对象
  let objMap = allMap.get(obj);
  if (!objMap) {
    // 首次加载时无 map，创建
    objMap = new Map();
    allMap.set(obj, objMap); // allMap 添加 obj 对象映射
  }

  //   2、从 objMap 中，根据key，找到 obj 对应的 Depend 对象
  let dep = objMap.get(key); // 将所有的 dep对象设置到 obj 对应的 value中
  if (!dep) {
    dep = new Depend();
    objMap.set(key, dep);
  }

  return dep;
}
/**-------------------------------------------重点 end--------------------------- */

// const dep = new Depend()

// 对属性的 key 进行遍历绑定
Object.keys(user).forEach((key) => {
  let val = user[key]; // 属性值
  Object.defineProperty(user, key, {
    set: function (newV) {
      val = newV;
      //   值改变时，通过 对象的 key，拿到 key 对应的 dep对象并执行
      const dep = getDeped(user, key);
      dep.notify();
    },
    get: function () {
      // 获取 user 对应的 dep 对象
      const dep = getDeped(user, key);
      // 当获取时将应用 obj 的 fn 添加到 依赖中
      dep.addDepend(reactiveFn);
      return val;
    },
  });
});

// 设置一个专门执行响应式函数的 fn
let reactiveFn = null;
function watchFn(fn) {
  reactiveFn = fn;
  fn(); // 首次需先执行一次，创建每个 key dep 依赖
  reactiveFn = null;
  //   dep.addDepend(fn)
}

watchFn(function foo() {
  console.log("foo name", user.name);
  console.log("foo age", user.age);
});

watchFn(function bar() {
  console.log("bar age", user.age);
});

console.log("name发生变化------");
user.name = "李四";

console.log("age发生变化------");
user.age = 30;
```

![执行结果](https://jsonq.top/cdn-static/2025/02/25/1740465695235-m5xhumil.jpg)

1. 每一个对象的每一个属性都会对应一个 dep 对象
2. 同一个对象的多个属性的 dep 对象是存放在一个 map 对象中的
3. 多个对象的 mao 对象，会被存放到一个 allMap 的对象中
4. 依赖收集：当执行 get 函数，自动添加 fn 函数

### 自动收集依赖 BUG 修改

当一个函数内部，重复使用一个属性时，函数会被执行多次

![BUG](https://jsonq.top/cdn-static/2025/02/25/1740465695342-v3ihkif3.jpg)

每次获取时，都会执行 get 内部的逻辑

**BUG 修复：对收集的依赖内部进行一个去重操作**

```js
class Depend {
  constructor() {
    this.reactiveFns = new Set();
  }
  // 添加到收集数组中
  addDepend(fn) {
    if (fn) {
      this.reactiveFns.add(fn);
    }
  },
  // 写这个，get内部就不需要手动传入参数，直接调用即可
  depend(){
    if(reactiveFn){
      this.reactiveFns.add(reactiveFn);
    }
  },

  notify() {
    this.reactiveFns.forEach((fn) => {
      fn();
    });
  }
}
```

### 多个对象响应式

在此之前，Object.keys 循环遍历的是一个写死的对象

```js
// 对属性的 key 进行遍历绑定
function reactive(obj) {
  Object.keys(obj).forEach((key) => {
    let val = obj[key]; // 属性值
    Object.defineProperty(obj, key, {
      set: function (newV) {
        val = newV;
        //   值改变时，通过 对象的 key，拿到 key 对应的 dep对象并执行
        const dep = getDeped(obj, key);
        dep.notify();
      },
      get: function () {
        // 获取 obj 对应的 dep 对象
        const dep = getDeped(obj, key);
        // 当获取时将应用 obj 的 fn 添加到 依赖中
        dep.depend();
        return val;
      },
    });
  });
  return obj; // 返回对象，不然拿到的是 undefined
}

// ==========================业务代码=======================

const user = reactive({
  name: "张三",
  age: 20,
  sex: "男",
});

const course = reactive({
  first: "HTML+CSS",
  second: "JavaScript",
});
watchFn(function () {
  console.log(user.name);
  console.log(user.age);
});

watchFn(function () {
  console.log(course.first);
});

console.log("user.age发生变化------");
user.age = 30;

console.log("course.first发生变化------");
course.first = "Vue";
```

### Vue2 响应式监听完整源码

```js
class Depend {
  constructor() {
    this.reactiveFns = new Set();
  }
  // 添加到收集数组中
  addDepend(fn) {
    if (fn) {
      this.reactiveFns.add(fn);
    }
  }
  depend() {
    if (reactiveFn) {
      this.reactiveFns.add(reactiveFn);
    }
  }

  notify() {
    this.reactiveFns.forEach((fn) => {
      fn();
    });
  }
}

// 设置一个专门执行响应式函数的 fn
let reactiveFn = null;
function watchFn(fn) {
  reactiveFn = fn;
  fn(); // 首次需先执行一次，创建每个 key dep 依赖
  reactiveFn = null;
  //   dep.addDepend(fn)
}

/**-------------------------------------------重点 start--------------------------- */
// 封装一个函数：负责通过 obj 获取对应的 depend 对象
const allMap = new WeakMap();
function getDeped(obj, key) {
  // 1、根据对象obj，找到对应的 Map 对象
  let objMap = allMap.get(obj);
  if (!objMap) {
    // 首次加载时无 map，创建
    objMap = new Map();
    allMap.set(obj, objMap); // allMap 添加 obj 对象映射
  }

  //   2、从 objMap 中，根据key，找到 obj 对应的 Depend 对象
  let dep = objMap.get(key); // 将所有的 dep对象设置到 obj 对应的 value中
  if (!dep) {
    dep = new Depend();
    objMap.set(key, dep);
  }

  return dep;
}
/**-------------------------------------------重点 end--------------------------- */

// const dep = new Depend()

// 对属性的 key 进行遍历绑定
function reactive(obj) {
  Object.keys(obj).forEach((key) => {
    let val = obj[key]; // 属性值
    Object.defineProperty(obj, key, {
      set: function (newV) {
        val = newV;
        //   值改变时，通过 对象的 key，拿到 key 对应的 dep对象并执行
        const dep = getDeped(obj, key);
        dep.notify();
      },
      get: function () {
        // 获取 obj 对应的 dep 对象
        const dep = getDeped(obj, key);
        // 当获取时将应用 obj 的 fn 添加到 依赖中
        dep.depend();
        return val;
      },
    });
  });
  return obj; // 返回对象，不然拿到的是 undefined
}

// ==========================业务代码=======================

const user = reactive({
  name: "张三",
  age: 20,
  sex: "男",
});

const course = reactive({
  first: "HTML+CSS",
  second: "JavaScript",
});
watchFn(function () {
  console.log(user.name);
  console.log(user.age);
});

watchFn(function () {
  console.log(course.first);
});

console.log("user.age发生变化------");
user.age = 30;

console.log("course.first发生变化------");
course.first = "Vue";
```

### Vue3 重构

主要就是从 `Object.defineProperty` 更改为 `Proxy`

```js
// 对属性的 key 进行遍历绑定
function reactive(obj) {
  const objProxy = new Proxy(obj, {
    set: function (target, key, newV, receiver) {
      //   target[key] = newV;
      Reflect.set(target, key, newV, receiver);
      const dep = getDeped(target, key);
      dep.notify();
    },
    get: function (target, key, receiver) {
      const dep = getDeped(target, key);
      dep.depend();
      //   return target[key];
      return Reflect.get(target, key, receiver);
    },
  });
  return objProxy;
}
```
