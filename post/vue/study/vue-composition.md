# setup

`setup` 函数实际上就是 选项式 API 的 data 函数 和 methods 函数 的合集

## setup 参数

setup 是一个函数

- setup 接收两个参数
  - props：其实就是**父组件传递过来的属性**会被放到 **props 对象**中，我们在 setup 中如果需要使用，那么就可以直接**通过 props 参数获取**
    - 对于**定义 props 的类型**，我们还是**和之前的规则是一样的，在 props 选项中定义**；
    - 并且在 template 中依然是可以正常去使用 props 中的属性，比如 message；
    - 如果我们在 setup 函数中想要使用 props，那么**不可以通过 this 去获取**；
    - 因为 props 有直接**作为参数传递到 setup 函数**中，所以我们可以**直接通过参数**来使用即可；
  - context：也称之为是一个 SetupContext，它里面包含三个属性：
    - attrs：所有的非 prop 的 attribute；
    - slots：父组件传递过来的插槽（这个在以渲染函数返回时会有作用，后面会讲到）；
    - emit：当我们组件内部需要发出事件时会用到 emit（因为我们不能访问 this，所以不可以通过 this.$emit 发出事件）；

## setup 返回值

所有的内容都写在 `setup` 函数中，若**需要 template 模板访问 `setup` 中定义的变量和方法，则必须让 `setup` 函数返回这些变量和方法**

```html
<template>
  <div id="app">
    <h2>当前count：{{ count }}</h2>
    <button @click="add">+1</button>
    <button @click="reduce">-1</button>
  </div>
</template>

<script>
  export default {
    setup() {
      let count = 0;
      const add = () => {};
      const reduce = () => {};

      // 所有需要template模板访问的变量和方法，都必须写在 setup 函数的返回值中
      return {
        count,
        add,
        reduce,
      };
    },
  };
</script>
```

## 响应式数据

### ref

参照 [setup 返回值](#setup-返回值) 渲染的数据，是**非响应式的**，虽然数据本身修改，但视图无法监听到其改变。需要使用`ref 函数`将数据变成响应式

```html
<script>
  import { ref } from 'vue';

  export default {
    name: 'App',

    setup() {
      // 默认定义的数据都不是响应式,需要使用 ref 修饰
      const count = ref(0);
      const add = () => {
        // 这里的 count 是一个被修饰过对象，而非 数字 0
        console.log(count);
        // 若需要操作变量，需要 .value 才能访问
        count.value++;
      };
      const reduce = () => {
        count.value--;
      };

      return {
        count,
        add,
        reduce,
      };
    },
  };
</script>
```

![count打印](https://static.jsonq.top/2024/10/18/161000084_1c862827-8768-4c74-8fb8-1633de5a19af.jpg)

> 在 **template 模板**中引入 ref 的值时，Vue 会自动进行解包操作，所以并**不需要在模板中通过 `ref.value` 的方式**来使用。
>
> 在 **setup 函数内部**，它依然是一个 ref 引用， 所以对其进行操作时，**依然需要使用 `ref.value` 的方式**

!> ref 函数适用于**基本类型**

#### 封装 hook

若当 setup 内部的逻辑被复用时，可以封装为一个 `hooks函数` 原版代码：

```html
<template>
  <div id="app">
    <h2>当前count：{{ count }}</h2>
    <button @click="add">+1</button>
    <button @click="reduce">-1</button>
  </div>
</template>

<script>
  import { ref } from 'vue';
  export default {
    setup() {
      const count = ref(0);
      const add = () => count.value++;
      const reduce = () => count.value--;

      return {
        count,
        add,
        reduce,
      };
    },
  };
</script>
```

封装 hooks：

```js
// useCount.js
import { ref } from 'vue';

export default function useCount() {
  const count = ref(0);
  const add = () => count.value++;
  const reduce = () => count.value--;

  return {
    count,
    add,
    reduce,
  };
}
```

使用 hook：

```html
<!-- App.vue -->
<!-- template 模板内容不变 -->
<script>
  // 引入 hooks
  import useCount from '@/hooks/useCount';
  export default {
    name: 'App',
    setup() {
      return { ...useCount() };
    },
  };
</script>
```

### reactive

`reactive` 要求必须传入的是一个**对象或者数组类型**,如果传入基本类型`Number、String、Boolean`等，控制台会报警告

![reactive警告](https://static.jsonq.top/2024/10/18/161000342_246a43f0-675b-4e11-8857-b5e2eac9c538.jpg)

```html
<template>
  <div id="app">
    <h2>{{ userInfo.name }}</h2>
    <ul>
      <li v-for="item in userList" :key="item">{{ item }}</li>
    </ul>
    <button @click="userList.splice(0, 1)">删除userList第0项</button>
  </div>
</template>

<script>
  import { reactive } from 'vue';

  export default {
    setup() {
      const userInfo = reactive({
        name: '张三',
        age: 20,
      });
      const userList = reactive(['张三', '李四', '王五']);

      return { userInfo, userList };
    },
  };
</script>
```

?> `reactive` 必须传入**对象或者数组类型**，`ref` 传入的是基本类型

### readonly

传递给其他组件数据时，往往希望**其他组件使用我们传递的内容**，**但是不允许它们修改时**，可以使用 `readonly` ；

`readonly` 会返回原始对象的只读代理（也就是它依然是一个 Proxy，这是一个 proxy 的 set 方法被劫持，并且不能对其进行修改）

- 开发中常见的 readonly 方法会传入三个类型的参数：

  - 类型一：普通对象
  - 类型二：`reactive` 返回的对象
  - 类型三：`ref` 的对象

- readonly **返回的对象都是不允许修改**的；
- 但是经过 readonly **处理的原来的对象是允许被修改**的；
  - 比如 `const info = readonly(obj)`，info 对象是不允许被修改的；
  - 当 **obj 被修改**时，**readonly 返回的 info 对象**也会被修改；
  - 但是我们**不能去修改 readonly 返回的对象 info**；

```js
const reactiveInfo = reactive({ name: '张三', age: 20 });
// readonly 修饰的数据，虽然是响应式，但是只读，无法通过 readonly 修饰的变量去更改数据
const readonlyInfo = readonly(reactiveInfo);

// ref也是一样的
const refName = ref('666');
const readonlyName = readonly(refName);
```

![readonly示例](https://static.jsonq.top/2024/10/18/161000545_d5a8bd2b-f1b8-49bf-b410-0d383216a1b8.jpg)

### toRefs

`reactive` 返回的对象进行解构得到的数据，**都不再是响应式**的：

```js
const info = reactive({
  name: '张三',
  age: 20,
});
// 直接解构的数据，再去更改 info.name info.age，视图是不会变化的，响应式丢失
// const { name, age } = info

// 使用 toRefs 修饰，可以使数据保持响应式
const { name, age } = toRefs(info);
```

#### toRef

当只转换一个 reactive 对象中的属性为 ref, 那么可以使用 toRef 的方法

```js
// toRef 第一个参数：需要解构的对象，第二个参数：需要解构的属性名
const nameRef = toRef(info, 'name');

changeName = () => (info.name = '李四');
```

## setup 中的 emit（子传父）

**setup 中没有 this**，所以子传父的`this.$emits("changeEmit",xxx)`在 setup 的写法中是不适用的，需要使用如下写法：

```js
export default {
  emits: ['changeEmit'],
  setup(props, context) {
    function changeParentValue() {
      context.emit('changeEmit', xxx);
    }

    return { changeParentValue };
  },
};
```

> setup 接收的第二个参数 `context`，可以使用 `context.emit` 进行子传父操作

# computed

- 接收一个 **getter 函数**，并为 getter 函数返回的值，返回一个不变的 ref 对象；
- 接收一个具有 **get 和 set** 的对象，返回一个可变的（可读写）ref 对象；

选项式 computed 写法：

详情可查看 [初识计算属性 computed](/post/vue/basic/vue-know.md#初识计算属性-computed)

```html
<script>
  export default {
    data() {
      return {
        firstName: '李',
        lastName: '狗蛋',
      };
    },
    computed: {
      // 简化写法
      fullName() {
        return this.firstName + ' ' + this.lastName;
      },
      // 完整写法
      fullName: {
        get() {
          return this.firstName + ' ' + this.lastName;
        },
        set(value) {
          const handleName = value.split(' ');
          this.firstName = handleName[0];
          this.lastName = handleName[1];
        },
      },
    },
  };
</script>
```

组合式 computed 写法：

```html
<script>
  import { reactive computed } from "vue";
  export default {
    setup() {
      const name = {
        firstName:"李",
        lastName:"狗蛋"
      }
      // setup 简化写法
      const fullName = computed(() => {
        return name.firstName + " " + name.lastName;
      });
      // setup 完整写法
      const fullName = computed({
        get() {
          return name.firstName + " " + name.lastName;
        },
        set(value) {
          const handleName = value.split(" ");
          name.firstName = handleName[0];
          name.lastName = handleName[1];
        },
      });

      // fullName 经过 computed 修饰，其本身就是一个 Ref，设置值需要通过 .value 访问
      // 若要设置 computed 监听的值，需要书写完整的 get set，并在 set 中书写需要操作的逻辑
      function setFullName(){
        fullName.value = "张 全蛋"
      }

      return {
        fullName,
        setFullName
      };
    },
  };
</script>
```

![computed修饰的返回结果](https://static.jsonq.top/2024/10/18/161000747_b0024562-a6be-4e69-9abc-f8f8608269e6.jpg)

> computed 修饰后，返回的结果就是一个 Ref 修饰的响应式值

# ref 获取 Ele 节点

和选项式中的 `$ref` 的目的是相同的。在 Vue2 中，获取元素 DOM 节点需要 **给元素绑定 ref="xxx"** 和 通过 **this.$refs.xxx**进行访问

详情可查看 [refs](/post/vue/basic/vue-components.md#refs) Vue3 的 setup 中，使用如下方式

```html
<template>
  <div id="app">
    <h2 ref="titleRef">h2标题</h2>
    <button @click="getElements">获取ref</button>
    <MyList ref="cmpRef" />
  </div>
</template>

<script>
  import { ref } from 'vue';
  import MyList from '@/components/MyList.vue';

  export default {
    name: 'App',
    components: { MyList },

    setup() {
      // 创建 ref 相当于 React 的 const titleRef = useRef()
      const titleRef = ref();
      // 获取 ref 相当于 React 的 titleRef.current
      function getElements() {
        console.log('h2的ref', titleRef.value);
        // 可以通过 cmpRef.value.xxx 访问 组件内部的数据
        console.log('组件的ref', cmpRef.value);
      }
      return {
        titleRef,
        getElements,
        cmpRef,
      };
    },
  };
</script>
```

![ref绑定节点](https://static.jsonq.top/2024/10/18/161000942_744d6626-2770-4d9b-80f6-b5f38506433c.jpg)

# 生命周期

setup 可以用来替代 data 、 methods 、 computed 等等这些选项，也可以替代 生命周期钩子

选项式生命周期详情可查看 [Vue2 生命周期](/post/vue/basic/vue-components.md#生命周期)

| 选项式 API    | 组合式 API      |
| ------------- | --------------- |
| beforeCreate  | -               |
| created       | -               |
| beforeMounte  | onBeforeMount   |
| mounted       | onMounted       |
| beforeUpdate  | onBeforeUpdate  |
| updated       | onUpdated       |
| beforeUnmount | onBeforeUnmount |
| unmounted     | onUnmounted     |
| activated     | onActivated     |
| deactivated   | onDeactivated   |

组合式 API 写法：

```js
export default {
  beforeMount() {
    console.log('beforeMount');
  },
};
```

选项式 API 写法：

```js
import { onMounted } from 'vue';

export default {
  setup() {
    onMounted(() => {
      console.log('onMounted');
    });
  },
};
```

# provide/inject

关于 Vue2 的 Provide 和 Inject [点击查看详情](/post/vue/basic/vue-components.md#provide-inject)

provide 提供数据（响应式和非响应式）：

```js
// App.vue
import { ref, provide } from 'vue';
import MyList from './components/MyList.vue';

export default {
  components: { MyList },
  setup() {
    const name = ref('张三');
    // provide 提供的是响应式的，inject注入时得到的也是响应式的数据
    provide('name', name);
    provide('age', 18);
    return { name };
  },
};
```

inject 注入：

```js
// MyList.vue
import { inject } from 'vue';
export default {
  setup() {
    const name = inject('name');
    const age = inject('age');
    // const age = inject("age",100)   // 设置默认值
    return { name, age };
  },
};
```

# 侦听数据的变化

## watch

`function watch(source: string, callback: function, options?: object)`

关于 Vue2 的 watch [点击查看详情](/post/vue/basic/vue-know.md#侦听器-watch)

Vue2 选项式 API watch

```js
data() {
    return {
      question: null,
    }
  }
  watch: {
    // question 就是需要侦听的变量
    question(newV, oldV) {
      console.log("newV：" + newV, "oldV：" + oldV);
    },
  },
```

Vue3 组合式 API watch

```js
import { reactive, watch } from 'vue';

export default {
  setup() {
    // 1、定义数据
    const info = reactive({ name: '张三', age: 20 });

    // 侦听数据的变量
    watch(
      info,
      (newV, oldV) => {
        // Proxy{...}, Proxy{...}
        console.log(newV, oldV);
      },
      { immediate: true },
    );

    // 侦听 reactive 的变化，需要返回普通对象，而不是 Proxy，需要侦听的参数为回调，并解构
    // 且侦听的参数解构后，默认的 deep：true 会失效，需手动设置为 true
    watch(
      () => ({ ...info }),
      (newV, oldV) => {
        // Proxy{...}, {...}
        console.log(newV, oldV);
      },
      { immediate: true, deep: true },
    );

    return { msg };
  },
};
```

> 默认会开启深度侦听
>
> 侦听 reactive 的变化，需要返回普通对象，而不是 Proxy，需要侦听的参数为回调，并解构。且侦听的参数解构后，默认的 `deep：true` 会失效，需手动设置为 true

## watchEffect

watchEffect 的原理和 React 的 useEffect 比较类似，不同的是：watchEffect 会**自动收集函数内部的依赖**，而 useEffect 需要**手动传入依赖项**

```html
<template>
  <div id="app">
    <h2>当前counter：---{{ counter }}</h2>
    <h2>当前name：---{{ name }}</h2>

    <button @click="counter++">修改counter</button>
    <button @click="name = '李四'">修改name</button>
  </div>
</template>

<script>
  import { ref, watchEffect } from 'vue';

  export default {
    setup() {
      // 1、定义数据
      const counter = ref(0);
      const name = ref('张三');
      // 1、watchEffect 传入的函数默认会直接执行
      // 2、在执行过程中，会自动收集依赖，依赖改变，函数重新执行
      watchEffect(() => {
        // 当更改 name 的时候，因为函数内部没有 name 的依赖，所以该函数不会重新执行
        console.log('---', counter.value);
      });

      return { counter, name };
    },
  };
</script>
```

![watchEffect基本使用](https://static.jsonq.top/2024/10/18/161001158_9c5891a8-2d21-41e4-8b22-b463aabac5f2.jpg)

### 停止侦听

当需要手动停止 watchEffect 的侦听时候，可以采用如下写法：

```js
// 1、拿到 watchEffect 的返回值
const stopWatch = watchEffect(() => {
  console.log('---', counter.value);
  if (counter.value > 5) {
    // 重新调用 返回值即可停止侦听
    stopWatch();
  }
});
```

![watchEffect 停止侦听](https://static.jsonq.top/2024/10/18/161001368_b8a7d0c4-ab9e-4260-821b-065e527c28a9.jpg)

# script setup 语法糖

setup 语法糖，是在 Vue3.2 版本才成为正式版。

## 定义响应式数据/事件

- 必须要写`<script setup>`
- setup 语法糖，可以省去 `export default` 以及 `setup`函数，同时不用写 `return {...}`
- 引入的组件可以**直接使用**，无需再注册。（setup 语法糖中，`components`注册已无法使用）

```html
<template>
  <h2>{{ message }}</h2>
  <button @click="changeMsg">改变msg</button>
  <MyList />
</template>

<script setup>
  import { ref } from 'vue';
  import MyList from '@/components/MyList.vue';

  const message = ref('Hello World');

  function changeMsg() {
    message.value = '李四';
  }
</script>
```

![setup 语法糖基本使用](https://static.jsonq.top/2024/10/18/161001568_52925180-5caf-4c0b-b860-68c8724c1b9c.jpg)

## defineProps()和 defineEmits()

defineProps 使用：

```html
<!-- MyList.vue -->
<template>
  <h4>{{ props.name }}---{{ props.age }}</h4>
</template>

<script setup>
  import { defineProps } from 'vue';
  const props = defineProps({
    name: {
      type: String,
      default: '默认值',
    },
    age: {
      type: Number,
      default: 0,
    },
  });
</script>
```

> `defineProps()` 实际上是可以不用导入的，也不用定义 props，访问时直接通过 `{{ name }}` 就可以进行访问。但是 ESLint 严格模式下，还是需要导入 defineProps 的

defineEmits 使用：

```html
<template>
  <h4>MyList组件</h4>
  <button @click="sendListClick">传给父组件</button>
</template>

<script setup>
  import { defineEmits } from 'vue';
  // defineEmits 接收数组，数组内部就是需要发出的 所有事件名
  const emits = defineEmits(['showList']);
  function sendListClick() {
    // emits 的第一个参数：选择需要发出的事件名，第二个参数：需要发出的数据
    emits('showList', [{ name: '张三', age: 18 }]);
  }
</script>
```

![defineEmits使用](https://static.jsonq.top/2024/10/18/161001772_d9e7da12-b832-4af0-8f06-9720b3cf662d.jpg)

## defineExpose()

正常我们可以通过`ref="xxx"`，`xxx.value`来访问组件内部的数据，但在 setup 语法糖中，使用 `<script setup>` 的组件是默认关闭的，不会暴露任何在 `<script setup>` 中声明的绑定，是无法访问其数据实例的。

通过 `defineExpose` 编译器宏来显式指定在 `<script setup>` 组件中要暴露出去的 property。这样绑定的 ref 才能访问这个 property。

```html
<script setup>
  import { defineExpose } from 'vue';

  function foo() {
    console.log('Children foo Function');
  }
  // 选择性暴露出可以访问的实例
  defineExpose({
    foo,
  });
</script>
```
