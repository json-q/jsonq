---
title: vue tsx 与 template 的相互使用
date: 2025-01-23
---

vue 的响应式数据 + jsx 开发体验简直不要太好，心智负担确实小，~~简直完爆 react~~（纯属个人暴论），不足的地方就是生态了，这点确实比不过 react。

本文更侧重于 TS 类型的写法，毕竟初次接触 vue jsx 时，实在对其 TS 类型声明很不顺手。要说 vue 模板语法哪些 API 不能在 jsx 中使用，也就是一些 define 宏函数了，其它都正常使用。

# v-model 双向绑定

注意：在 jsx 场景下，仍然可以使用 `v-model`，但是不能使用 `v-model.lazy` 等修饰符

> 网上有使用 `value` + `event` 事件的写法，都可以，论简单还是 `v-model`

template 写法

```html
<script setup lang="ts">
  const inputVal = ref('');
</script>

<template>
  <input v-model="inputVal" />
  <div>{{ inputVal }}</div>
</template>
```

JSX 写法：ref 响应式值必须使用 `.value` 访问，这点和模板语法的 script 标签中使用规则一致

```jsx
export default defineComponent({
  name: 'ChildJSXComp',
  setup() {
    const inputVal = ref('');

    return () => (
      <>
        <input v-model={inputVal.value} />
        <div>{inputVal.value}</div>
      </>
    );
  },
});
```

# Props

## 基础例子

最基础的例子，子组件接收一个 `message` 属性，并限制类型为 string | number

template 写法

```html
<script setup lang="ts">
  interface MyProps {
    message?: string | number;
  }
  const props = defineProps<MyProps>();
</script>

<template> {{ props.message }} </template>
```

jsx 写法：使用 `PropType` 可以对入参类型做进一步的类型约束

```jsx
export default defineComponent({
  name: 'ChildJSXComp',
  props: {
    message: { type: [String, Number] as PropType<string | number> },
  },
  setup(props) {
    return () => <>{props.message}</>;
  },
});
```

### PropType

- 在 vue 模板的 setup 语法糖写法下，props 接收直接使用 `const props = defineProps<MyProps>()` 定义即可
- 在 jsx 中，不能直接定义 TS 类型，需要使用 类型标注 + `PropType` 实现。

[`PropType`](https://cn.vuejs.org/guide/typescript/options-api.html#typing-component-props) 在 JSX 中可以对 props 的接收类型做更细致的类型约束

```tsx
const selectorProps = {
  // 细化 Array 类型为 SelectorOption[]
  options: { type: Array as PropType<SelectorOption[]>, default: () => [] },

  // 细化 Object 为 { label: string; value: string }
  fieldNames: {
    type: Object as PropType<{ label: string; value: string }>,
    default: () => ({ label: 'label', value: 'value' }),
  },

  // 细化 Fuction 类型为 (value: string) => void
  onSearch: { type: Function as PropType<(value: string) => void> },
};

export default defineComponent({
  // ...
  props: selectorProps,
  setup(props) {
    // ...
  },
});
```

#### 根据 props 的类型标注生成 TS 类型

之前使用的 props 标注是属于参数校验，是 Schema 数据，而非 TS。如果其它组件基于此组件进行二次封装，需要该组件的 TS 类型，此时可以使用 [`ExtractPublicPropTypes`](https://cn.vuejs.org/api/utility-types.html#extractpublicproptypes) 来将 props 类型标注转为 TS 类型，这样其它组件就可以使用了。

![image](https://jsonq.top/cdn-static/2025/02/25/1740465280589-7pgol2nf.png)

对于 vue 版本低于 3.3 的，可以使用 [`ExtractPropTypes`](https://cn.vuejs.org/api/utility-types.html#extractproptypes)，个人感觉两者的关系就是 `type ExtractPublicPropTypes = Patrial<ExtractPropTypes>`

## props 传递事件

个人更推荐使用 props 来传递事件，而非 `emits` 属性接收，原因如下：

- emits 接收事件在 eslint 下表现并不友好（不禁用某些规则的前提下）
- emits 接收事件，最终也可以合并到 props 上，通过 props 使用

对于第一点，下一小节会讲 emits 的类型定义，对于第二点，如图所示：

![image](https://jsonq.top/cdn-static/2025/02/25/1740465280814-vmuyxr5g.png)

虽然是在 `emits` 属性上定义的事件，但是 props 依然可以访问，那为什么不直接在 props 上定义呢？ `ant-design-vue` 就是把事件写在了 props 中，但是也有不少组件库依然写在 `emits` 里，看个人习惯吧。

> 可能是为了区分，事件是事件（emits），属性是属性（props），不让属性和事件混在一起，从代码的结构上来说更严谨。

# emits 事件接收

template 写法，使用 `defineEmits`

```html
<script setup lang="ts">
  interface SelectorEmits {
    (e: 'cancel'): void;
    (e: 'search', value: string): void;
  }
  // 3.3 + 提供的事件类型简写
  // interface SelectorEmits {
  //   cancel: [];
  //   select: [value: string];
  // }
  const emit = defineEmits<SelectorEmits>();

  const clickButton = () => {
    emit('search', '1');
  };
</script>

<template>
  <button @click="clickButton"></button>
</template>
```

jsx 写法，使用 `emits`

- `emits` 以字符串数组定义事件，则无法对事件进行详细的类型约束

```jsx
export default defineComponent({
  // ...
  emits: ['search', 'cancel'],
  setup(props, { emit }) {
    const clickButton = () => {
      emit('search', '1');
    };

    return () => <button onClick={clickButton}>Test</button>;
  },
});
```

![image](https://jsonq.top/cdn-static/2025/02/25/1740465280885-sgd9pvww.png)

- `emits` 标注 TS 类型，将 `emits` 换成对象写法

```jsx
  emits: {
    search: (value: string) => true,
    cancel: () => true,
  },
```

这种写法在 eslint 中会出现一些问题，例如 `search` 事件，会报 “声明值未使用” 的问题，所以我推荐在 props 中定义事件，当然也可以全局禁用该规则，就不会出现这个报错问题。

![image](https://jsonq.top/cdn-static/2025/02/25/1740465280956-dz61bpsb.png)

# slot 插槽

在 jsx 中写插槽时，没有类型提示，想要存在类型提示，只能手动标注类型

## 子组件接收插槽（默认插槽和传参插槽）

template 写法，使用 `defineSlots` 对插槽的类型进行标注，同时 IDE 也有友好的类型提示。

```html
<script setup lang="ts">
  import type { VNode } from 'vue';

  interface MySlots {
    default?(): VNode;
    list?(scoped: { list: string[] }): VNode;
  }
  defineSlots<MySlots>();
</script>

<template>
  <header>Header</header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="list" :list="['1', '2', '3', '4']"></slot>
  </footer>
</template>
```

jsx 写法，使用 `slots` 属性接收，所有插槽都是以函数调用方式渲染

slots 的 TS 写法和 props 类似，都是通过 `as` 来进一步约束类型

```jsx
export default defineComponent({
  name: 'ChildComp',
  slots: Object as SlotsType<MySlots>,

  setup(props, { slots }) {
    return () => (
      <>
        <header>Header</header>
        <main>{slots.default?.()}</main>
        <footer>{slots.list?.({ list: ['1', '2', '3', '4'] })}</footer>
      </>
    );
  },
});
```

## 父组件使用插槽（默认插槽和传参插槽）

template 写法

```html
<ChildComp>
  <template #default> Parnt Content </template>
  <template #list="scoped">
    <p v-for="item in scoped.list" :key="item">{{ item }}</p>
  </template>
</ChildComp>
```

使用 `defineSlots` 的好处就是拥有更完整、更友好的 TS 类型提示。

![image](https://jsonq.top/cdn-static/2025/02/25/1740465281030-0s6248gg.png)

jsx 有两种使用插槽的写法

**写法一：** 使用 `v-slots`

```jsx
export default defineComponent({
  name: "ParentComp",

  setup() {
    return () => (
      <ChildJSXComp
        v-slots={{
          default: () => <div>Parnt Content</div>,
          list: (scoped: { list: string[] }) => {
            return scoped.list.map((item) => <p key={item}>{item}</p>);
          },
        }}
      />
    );
  },
});
```

> `v-slots` 接收的是一个对象，对象的 key 就是插槽名，value 就是一个函数。这也就是为什么在 jsx 子组件使用插槽是 `slots.default?.()` 的原因：因为传入的插槽就是函数，调用函数才能得到 VNode

**写法二：** 组件标签内写插槽，用闭合标签的内容来代替 `v-slots`，其实就是把 `v-slots` 的内容粘贴到闭合标签中

```jsx
<ChildJSXComp>
  {{
    default: () => <div>Parnt Content</div>,
    list: (scoped: { list: string[] }) => {
      return scoped.list.map((item) => <p key={item}>{item}</p>);
    },
  }}
</ChildJSXComp>
```

如果只传递默认插槽，也可以用最常规的写法，闭合标签内写 dom 元素

```jsx
<ChildJSXComp>
  <div>Parnt Content</div>,
</ChildJSXComp>
```

# v-bind 动态绑定多个值

先说结论：多个值的绑定情况下，vue 的 `v-bind="myObject"` = jsx 的 `{...myObject}`

这里就以 useuse 的 [`useVirtualList`](https://vueuse.nodejs.cn/core/useVirtualList/#usevirtuallist) 为例

![image](https://jsonq.top/cdn-static/2025/02/25/1740465281106-rt0h8rqd.png)

以上的 `v-bind` 写法换成 jsx 就如下所示

![image](https://jsonq.top/cdn-static/2025/02/25/1740465281180-2a9h8z3q.png)

由于 `wrapperProps` 是一个 `computed` 计算结果，所以在使用时加 `.value`

# 其它

## 组件别名命名

注意：该命名是在 vue devtool 中查看使用的，而非代码中组件的引用别名

在 vue 3.3+ 之后，官方提供了 [`defineOptions`](https://cn.vuejs.org/api/sfc-script-setup.html#defineoptions) 来进行组件的别名命名（默认文件名为组件名），方便 vue devtools 中调试查看，毕竟没人愿意打开调试工具，一看组件标签名都是 `Index`。

template 写法

```html
<script setup lang="ts">
  defineOptions({ name: 'MyCompentName' });
</script>

// vue 3.3 之前需要额外的 script 标签定义
<script>
  export default {
    name: 'MyCompentName',
  };
</script>
```

jsx 写法

```jsx
export default defineComponent({
  name: 'MyCompentName',
});
```
