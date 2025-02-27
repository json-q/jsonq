---
title: 初识 Vue3
date: 2023-06-08
---

# 如何使用 Vue

- 根据官方推荐使用此命令安装的 vue 脚手架是基于 Vite 的

  ```bash
  npm init vue@latest
  ```

- 安装`vue/cli`工具，根据命令安装

  ```bash
  # 安装全局 cli
  npm install -g @vue/cli
  # 使用 vue create [文件名] 创建项目
  vue create start-vue
  ```

- 启动命令

  ```bash
  npm run serve
  ```

  具体安装流程图如下：

  - ![选择安装方式](https://jsonq.top/cdn-static/2025/02/25/1740465698615-n16bxyvc.jpg)
  - ![自定义安装选项](https://jsonq.top/cdn-static/2025/02/25/1740475766663-0pyu35yv.jpg)
  - ![选择Vue版本](https://jsonq.top/cdn-static/2025/02/25/1740465698715-n8pqoaf0.jpg)
  - ![选择ESLint规范](https://jsonq.top/cdn-static/2025/02/25/1740475766829-9so9iw5t.jpg)
  - ![代码检测时机](https://jsonq.top/cdn-static/2025/02/25/1740465698817-2f2374re.jpg)
  - ![配置文件保存位置](https://jsonq.top/cdn-static/2025/02/25/1740475766996-qk1zpgc4.jpg)
  - ![保存此次配置](https://jsonq.top/cdn-static/2025/02/25/1740465698995-qxexugyk.jpg)

  > 该配置是自定义创建项目，即**第三个选项**，若选择前两个，则直接创建默认项目配置。

# 模板语法(Mustache 语法)

- data 返回的对象是有添加到 Vue 的响应式系统中

  - 当 data 中的数据发生改变时，对应的内容也会发生更新。
  - Mustache 中不仅仅可以是 data 中的属性，也可以是一个 JavaScript 的表达式

  ![模板语法使用](https://jsonq.top/cdn-static/2025/02/25/1740465699144-i0b45pvu.jpg)

# data 属性

- data 属性是传入一个函数，并且该函数需要返回一个对象
  - 在 **Vue2.x** 的时候，**也可以传入一个对象**（虽然官方推荐是一个函数）
  - 在 **Vue3.x** 的时候，**必须传入一个函数**，否则就会直接在浏览器中报错
- data 中返回的对象会被 **Vue 的响应式系统劫持**，之后对该对象的**修改或者访问**都会在劫持中被处理
  - 所以我们在 template 或者 app 中**通过`{{counter}}`访问 counter**，可以从对象中获取到数据
  - 所以我们**修改 counter 的值**时，**app 中的`{{counter}}`也会发生改变**

# methods 属性

- methods 属性是一个对象，通常我们会在这个对象中定义很多的方法
  - 这些方法可以**被绑定到 模板**中；
  - 在该方法中，我们可以**使用 this 关键字**来直接访问到 data 中返回的对象的属性；
- 官方文档有这么一段描述：

![原因](https://jsonq.top/cdn-static/2025/02/25/1740465699252-14u5iyxd.jpg)

简单使用：

```html
<div id="app">
  <h2>当前计数：{{count}}</h2>
  <button @click="add">+1</button>
  <button @click="minus">-1</button>
</div>
...
<script>
  const app = Vue.createApp({
    data() {
      return {
        count: 4,
      };
    },
    methods: {
      add() {
        this.count++;
      },
      minus() {
        this.count--;
      },
    },
  });
</script>
```

# 指令

## v-for（列表渲染）（重要）

`v-for`指令可以遍历**所有可迭代数据类型**

- 数组遍历：
  - 格式： `"(item, index) in 数组"`。`item`为元素项，`index`为元素索引
- 对象遍历：
  - 一个参数： `"value in object"`
  - 二个参数： `"(value, key) in object"`
  - 三个参数： `"(value, key, index) in object"`

![列表渲染](https://jsonq.top/cdn-static/2025/02/25/1740465699342-dvg2ga5p.jpg)

> 当我们需要遍历渲染的是**内容区域时**，可以使用`template`元素，例如：`<template v-for="item in arr">...</template>`

## v-bind(绑定属性)（重要）

在内容需要动态渲染的同时(插值语法)，某些属性也需要动态绑定(v-bind)。

- 动态绑定 a 元素的 href 属性；
- 动态绑定 img 元素的 src 属性；

### 绑定基本属性

`v-bind`用于**绑定一个或多个属性值**，或者**向另一个组件传递 props 值**

```html
<template>
  <!-- 完整写法 -->
  <img v-bind:src="src" alt="" />
  <!-- 语法糖写法（简写） -->
  <img :src="src" alt="" />
  <!-- 这种写法，右侧等式是纯静态数据，不是 data 中的变量 -->
  <img src="src" alt="" />

  <!-- 绑定 a 元素 的动态 href -->
  <a :href="href"></a>
</template>
```

> `v-bind`修饰的属性，右侧都**属于变量**，会被`Vue`进行编译，不再是一个普通的字符串或固定值

### 绑定动态 class

- 在开发中，有时候我们的元素 class 也是动态的，比如
  - 当数据为**某个状态**时，字体显示红色。
  - 当数据**另一个状态**时，字体显示黑色。我们可以传给 `:class` (`v-bind:class` 的简写) 一个对象，以动态地切换 class
- 绑定 class 有两种方式：

  - **对象语法**

  ```html
  <style>
    .Hello {
      color: blue;
    }
    .my {
      font-size: 12px;
    }
    .son {
      width: 200px;
      height: 30px;
    }
    .jump {
      background-color: aqua;
    }
    .active {
      color: red;
    }
  </style>
  <div id="app">
    <!-- 普通的绑定方式 -->
    <div :class="className">data属性值当做类名</div>
    <!-- 对象绑定 -->
    <!-- 动态切换 class 是否加入：{类（变量）：boolean(true/false)} -->
    <div class="my" :class="{son:true,jump:true,rap:false}">动态布尔值显示类名</div>
    <!-- 类名添加移除切换  isActive:true/false -->
    <div :class="{'active':isActive}">类名添加移除切换</div>
    <button @click="this.isActive = !this.isActive">切换</button>
    <!-- 调用函数获取对象格式的样式 -->
    <div :class="getClassObj()">对象格式的样式</div>
  </div>
  <script>
    data() {
      return {
        className: "Hello jump",
        isActive: true,
      };
    },
    methods: {
      getClassObj() {
        return { son: true, jump: this.isActive, rap: false };
      },
    },
  </script>
  ```

  ![结果](https://jsonq.top/cdn-static/2025/02/25/1740465699445-hozbm4oc.jpg)

  - **数组语法**

  ```html
  <style>
    .Hello {
      color: blue;
    }
    .jump {
      background-color: aqua;
    }
    .active {
      color: red;
    }
  </style>
  <div id="app">
    <!-- 直接传入一个数组 -->
    <div :class="['Hello','jump']">直接传入一个数组</div>
    <!-- 数组中可以使用三元运算符或者绑定变量 -->
    <div class="my" :class="['Hello','jump',isActive?'active':'']">
      数组中可以使用三元运算符或者绑定变量
    </div>
    <hr />
    <!-- 数组中也可以使用对象语法 -->
    <div :class="['Hello','jump',{'active':isActive}]">数组中也可以使用对象语法</div>
    <hr />
    <button @click="this.isActive = !this.isActive">切换</button>
  </div>
  <script>
    data() {
      return {
        isActive: true,
      };
    },
  </script>
  ```

  ![结果](https://jsonq.top/cdn-static/2025/02/25/1740465699533-pcthn8wv.jpg)

### 绑定动态 style

我们可以利用`v-bind:style`来绑定一些**CSS 内联样式** **CSS property** 名可以用**驼峰式 (camelCase)** 或**短横线分隔**(kebab-case，记得用引号括起来) 来命名；

- 对象语法：

  ```html
  <div id="app">
    <!-- 传入一个对象样式，并且内容都是确定的 -->
    <div :style="{color:'red',fontSize:'30px','background-color':'blue'}">普通内联对象样式</div>
    <hr />
    <!-- 变量样式：传入一个对象，值来自于data-->
    <div :style="{color:'red',fontSize: size + 'px','background-color':'blue'}">
      变量内联对象样式
    </div>
    <hr />
    <!-- 对象数据：直接在data中定义一个对象使用 -->
    <div :style="styleObj">data中的对象数据</div>
  </div>
  <script>
    data() {
      return {
        size: 30,
        styleObj: {
          color: "red",
          fontSize: "30px",
          backgroundColor: "blue",
        },
      };
    },
  </script>
  ```

  ![结果](https://jsonq.top/cdn-static/2025/02/25/1740465699639-3caau1yg.jpg)

- 数组语法：
  ```html
  <div id="app">
    <!-- 数组语法可以将多个样式对象作用到同一个元素上 -->
    <div :style="[styleObj1,styleObj2]">数组样式</div>
  </div>
  <script>
    data() {
      return {
        styleObj1: {
          color: "red",
        },
        styleObj2: {
          fontSize: "30px",
          backgroundColor: "blue",
        },
      };
    },
  </script>
  ```

### 绑定动态属性

在某些情况下，我们属性的名称可能也不是固定的：

- 前端我们无论绑定`src、href、class、style`，属性名称都是固定的
- 如果**属性名称不是固定的**，我们可以使用 `:[属性名]="值"` 的格式来定义
- 这种绑定的方式，我们称之为**动态绑定属性**

  ```html
  <div id="app">
    <!-- 属性的名称 和 值都是动态的 -->
    <div :[name]="value">动态值和动态属性</div>
  </div>
  <script>
    data() {
         return {
           name: "dynamic",
           value: "aaa",
         };
       },
  </script>
  ```

  ![结果](https://jsonq.top/cdn-static/2025/02/25/1740465699748-f27hr8o4.jpg)

### 绑定动态对象属性

如果我们希望将一个对象的所有属性，绑定到元素上的所有属性：**可以直接使用 `v-bind` 绑定一个 对象**

```html
<div id="app">
  <div v-bind="info">info 对象会被拆解成div的各个属性</div>
</div>
<script>
  data() {
    return {
      info: {
        name: "zs",
        age: 20,
        sex: "男",
      },
    };
  },
</script>
```

![结果](https://jsonq.top/cdn-static/2025/02/25/1740465699834-k5ahw4ye.jpg)

## v-on 事件绑定（重要）

用户对网页进行各种各样的交互：这个时候，我们就必须监听用户发生的事件，比如点击、拖拽、键盘事件等等在 Vue 中使用`v-on`指令可以监听各种事件的触发。v-on 的总结使用：

> - 缩写：@
> - 预期：Function | Inline Statement | Object
> - 参数：event
> - 修饰符：✓ .stop - 调用 event.stopPropagation() `阻止事件的冒泡`。✓ .prevent - 调用 event.preventDefault() `阻止默认事件`。✓ .capture - 添加事件侦听器时使用 capture 模式 `事件捕获`。✓ .self - 只当事件是从侦听器绑定的元素本身触发时才触发回调。✓ .{keyAlias} - 仅当事件是从特定键触发时才触发回调。✓ .once - 只触发一次回调。✓ .left - 只当点击鼠标左键时触发。✓ .right - 只当点击鼠标右键时触发。✓ .middle - 只当点击鼠标中键时触发。✓ .passive - { passive: true } 模式添加侦听器
> - 用法：绑定事件监听

### v-on 的基本使用

```html
<div id="app">
  <p>{{ count }}</p>
  <!-- 基本使用 click 点击事件 -->
  <!-- 绑定一个表达式 -->
  <button v-on:click="count++">表达式的点击+1</button>
  <!-- 绑定一个 methods 中的方法 -->
  <button v-on:click="minus">methods方法的点击-1</button>
  <!-- v-on 简写 @ -->
  <button @click="minus">@格式的点击-1</button>

  <!-- mousemove鼠标移动事件 -->
  <div @mousemove="mouseMove" style="width: 100px; height: 100px; background-color: aqua">
    鼠标移动区域
  </div>

  <!-- 一个元素绑定多个事件 -->
  <div
    v-on="{click:divClick,mousemove:mouseMove}"
    style="width: 100px; height: 100px; background-color: blueviolet"
  >
    鼠标移动且点击区域
  </div>
</div>
<script>
  data() {
      return {
        count: 0,
      };
    },
    methods: {
      minus() {
        this.count--;
      },
      mouseMove() {
        console.log("鼠标在盒子中移动了");
      },
      divClick() {
        console.log("盒子被点击了");
      },
    },
</script>
```

### v-on 传递参数

当通过 `methods` 中定义方法，以供`@click`调用时，需要注意参数问题：◼ 情况一：如果该方法不需要额外参数，那么方法后的()可以不添加。 但是注意：如果方法本身中有一个参数，那么会默认将原生事件 `event` 参数传递进去 ◼ 情况二：如果既需要传入某些参数，同时需要 `event` 时，可以通过`$event` 传入事件。

```html
<div id="app">
  <!-- 事件会默认吧event对象传入 -->
  <button @click="btnClick1">按钮1</button>
  <!-- 传入参数时，若要使用 event事件，需主动传入 $event ，并接收-->
  <button @click="btnClick2($event,count)">按钮2</button>
</div>
<script>
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    btnClick1(event) {
      console.log(event);
    },
    btnClick2(event, count) {
      console.log(event, count);
    },
  },
</script>
```

### v-on 的修饰符

详情请见 [v-on 事件绑定](#v-on-事件绑定重要) 中的修饰符。基本使用：

```html
<div id="app">
  <button @click.stop="btnClick">按钮</button>
  <input type="text" @keyup.enter="onEnter" />
</div>
```

## v-if 条件渲染（重要）

在某些情况下，我们需要根据当前的条件决定**某些元素或组件是否渲染**，这个时候我们就需要进行条件判断了。Vue 提供了下面的指令来进行条件判断：`v-if、 v-else、 v-else-if、 v-show`

### v-if、v-else、v-else-if

`v-if、v-else、v-else-if`用于根据条件来渲染某一块的内容

- 这些内容**只有在条件为`true`时**，才会被渲染出来；
- 这三个指令与 JavaScript 的条件语句`if、else、else if`类似；

```html
<div id="app">
  <input type="text" v-model.number="score" />
  <!-- 若一个判断中有多个 v-if，那么 v-else-if 会匹配与它最近的 v-if-->
  <h2 v-if="score > 90">优秀</h2>
  <h2 v-else-if="score > 80">良好</h2>
  <h2 v-else-if="score > 70">普通</h2>
  <h2 v-else>不及格</h2>
</div>
<script>
  data() {
    return {
      score: 10,
    };
  },
</script>
```

> `v-if` 的渲染原理： `v-if` 是惰性的；当条件为 `false` 时，其判断的内容完全不会被渲染或者会被销毁掉。当条件为 `true` 时，才会真正渲染条件块中的内容。

如图所示：

![结果](https://jsonq.top/cdn-static/2025/02/25/1740465699924-vkvhemun.jpg)

### template 元素

`v-if`是一个指令，所以必须将其添加到一个元素例如`div`上。但是如果我们希望切换的是**某个元素区域**，且**不希望`div`这种元素被渲染**，此时我们可以选择使用`template`标签。 `template`元素可以当做**不可见的包裹元素**，并且在 v-if 上使用，但是最终`template`**不会被渲染**出来。类似于小程序中的`block`

```html
<div id="app">
  <template v-if="show">
    <h2>哈哈哈</h2>
    <h2>哈哈哈</h2>
  </template>
  <template v-else>
    <h2>呵呵呵</h2>
    <h2>呵呵呵</h2>
  </template>
  <button @click="toggle">切换</button>
</div>
<script>
  data() {
    return {
      show: true,
    };
  },
  methods: {
    toggle() {
      this.show = !this.show;
    },
  },
</script>
```

![结果](https://jsonq.top/cdn-static/2025/02/25/1740465700019-2lgoyk9d.jpg)

### v-show

`v-show`和`v-if`的用法基本一致，也是根据一个条件决定是否显示元素或者组件：

```html
<div id="app">
  <h2 v-show="isShow">呵呵呵</h2>
</div>
```

### v-show 和 v-if 的区别

- 用法上：
  - v-show 是不支持 template；
  - v-show 不可以和 v-else 一起使用；
- 本质的区别：
  - `v-show` 元素无论是否需要显示到浏览器上，它的 **DOM 实际都是有存在**的，只是通过 CSS 的 `display` 属性来进行切换；
  - `v-if` 当条件为 `false` 时，其对应的原生**压根不会被渲染到 DOM 中**

> 开发中如何进行选择如果我们的原生需要在显示和隐藏之间频繁的切换，那么使用 v-show；如果不会频繁的发生切换，那么使用 v-if；

## v-model（重要）

### 基本使用

- `v-model` 指令可以在表单 `input、textarea 以及 select` 元素上创建**双向数据绑定**
- 它会根据**控件类型**自动选取正确的方法来更新元素
- 尽管有些神奇，**但 `v-model` 本质上不过是语法糖**，它**负责监听用户的输入事件来更新数据**，并在某种极端场景下进行一些特殊处理

```html
<div id="app">
  <input type="text" v-model="message" />
  <h2>{{ message }}</h2>
</div>
<script>
  data() {
    return {
      message:"你好"
    };
  },
</script>
```

![结果](https://jsonq.top/cdn-static/2025/02/25/1740465700105-ogtgu3ae.jpg)

### v-model 的原理

官方有说到，`v-model`的原理其实是背后有两个操作：

- **`v-bind` 绑定 value 属性**的值；
- **`v-on`绑定 input 事件**监听到函数中，函数会获取最新的值赋值到绑定的属性中；

```html
<input v-model="searchText" />
<!-- 等价于 -->
<input :value="searchText" @input="searchText = $event.target.value" />
```

### v-model 绑定其它元素

1. textarea

   ```html
   <div id="app">
     <textarea v-model="content" cols="30" rows="10" />
     <h2>article的值为：{{ article }}</h2>
   </div>
   ```

2. checkbox
   - **单个勾选框**：`v-model`为**布尔值**，此时 `value`值并不影响`v-model`的属性
   ```html
   <div id="app">
     <label for="agreement"> <input id="agreement" type="checkbox" v-model="isAgree" />同意 </label>
     <!-- 这里的 isAgree 显示的是 true/false -->
     <h2>{{ isAgree }}</h2>
   </div>
   ```
   - **多个复选框**：
     - 当是**多个复选框**时，因为可以选中多个，所以对应的**data 中属性是一个数组**。
     - 当选中某一个时，就会将对应的**input 的 value 添加到数组**中。
   ```html
   <div id="app">
     <input type="checkbox" value="sing" v-model="hobbies" />唱
     <input type="checkbox" value="jump" v-model="hobbies" />跳
     <input type="checkbox" value="rap" v-model="hobbies" />Rap
     <h2>{{ hobbies }}</h2>
   </div>
   <script>
     data() {
         return {
           hobbies: [],
         };
       },
   </script>
   ```
   ![结果](https://jsonq.top/cdn-static/2025/02/25/1740465700246-dfgcq4w1.jpg)
3. radio
   ```html
   <div id="app">
     <input type="radio" value="male" v-model="gender" />男
     <input type="radio" value="female" v-model="gender" />女
     <!-- gender 显示的就是 选中项的 value -->
     <h2>{{ gender }}</h2>
   </div>
   ```
4. select

- **单选下拉 select**：

```html
<div id="app">
  <select v-model="fruit">
    <option value="apple">苹果</option>
    <option value="orange">橘子</option>
    <option value="banana">香蕉</option>
  </select>
  <!-- 这里的 fruit 显示的就是 option 选中项的 value -->
  <h2>{{ fruit }}</h2>
</div>
```

- **多选下拉 select**：
  - 当多选时，`v-model` 绑定的就是一个数组。
  - 当选中多个值时，就会将选中的`option`对应的`value`添加到`v-model`绑定的数组中

### v-model 修饰符

1. **lazy**
   - 默认情况下，v-model 在进行双向绑定时，绑定的是 **input 事件**，那么会在每次内容输入后就将最新的值和绑定的属性进行同步；
   - 如果我们在 v-model 后跟上 lazy 修饰符，那么会将绑定的事件切换为 **change 事件**，只有在提交时（比如回车）才会触发；
2. **number**
   - `v-model` 绑定的值总是`string`类型，即使在我们设置`type="number"`也是"`string`类型
   - 如果我们希望转换为**数字类型**，那么可以使用 `.number 修饰符`
3. **trim** 如果要自动**过滤用户输入的空白字符**，可以给`v-model`添加 `trim 修饰符`

## v-html

默认情况下，如果我们展示的内容本身是 html 的，那么 vue 并不会对其进行特殊的解析，默认都当做普通字符串渲染。如果我们希望这个内容被 Vue 可以解析出来，那么可以使用 `v-html` 来展示；

```html
<div id="app">
  <div v-html="info"></div>
</div>
<script>
  data() {
    return {
      info: "<h2 style='color:red;'>你好</h2>",
    };
  },
</script>
```

![v-html](https://jsonq.top/cdn-static/2025/02/25/1740465700361-g35zyvti.jpg)

## v-pre

v-pre 用于**跳过元素和它的子元素的编译过程**，显示原始的 Mustache 标签跳过不需要编译的节点，加快编译的速度

![v-pre](https://jsonq.top/cdn-static/2025/02/25/1740465700450-cgpz76db.jpg)

## v-cloak

**这个指令保持在元素上直到关联组件实例结束编译** 和 CSS 规则如`[v-cloak] { display: none }`一起用时，这个指令可以隐藏未编译的 Mustache 标签直到组件实例准备完毕

![v-cloak](https://jsonq.top/cdn-static/2025/02/25/1740465700568-33tgu8dr.jpg)

> 页面在渲染时，当编译时间过长，未解析到模板语法的时候，页面实际显示的是`{{info}}`，编译完成时，才会替换为属性值。为了防止这种现象，可以使用`v-cloak`

## v-once(了解)

**v-once 用于指定元素或者组件只渲染一次**

- 当数据发生变化时，**元素或者组件以及其所有的子元素**将视为**静态内容**并且跳过
- 该指令可以用于**性能优化**

  ```html
  <h2 v-once>当前计数：{{count}}</h2>
  <button @click="add">+1</button>
  <button @click="minus">-1</button>
  ```

**如果是子节点，也是只会渲染一次**

```html
<div v-once>
  <h2>当前计数：{{count}}</h2>
  <button @click="add">+1</button>
  <button @click="minus">-1</button>
</div>
```

> 简单概括就是 **`v-once`修饰的节点以及其下属节点，都全部视为静态内容**

## v-text(了解)

```html
<h2 v-text="message">{{count}}</h2>
<!-- 等价于 -->
<h2>{{count}}</h2>
```

# 数组更新检测

Vue 将被侦听的数组的变更方法进行了包裹，所以它们也将会触发视图更新。这些被包裹的方法包括：`push()、pop()、shift()、unshift()、splice()、sort()、reverse()` 上面的方法会直接修改原来的数组。但是某些方法不会替换原来的数组，而是会生成新的数组，比如` filter()、concat() 和 slice()`

# 选项式 API（Options API）

## 复杂 data 的处理

- 我们知道，在模板中可以直接通过**插值语法**显示一些**data 中的数据**
- 但是在某些情况，我们可能需要对数据进行一些**转化后再显示**，或者需要将**多个数据结合起来进行显示**
  - 比如我们需要对**多个 data 数据进行运算**、**三元运算符来决定结果**、**数据进行某种转化后显示**
  - 在模板中使用**表达式**，可以非常方便的实现，但是设计它们的初衷是用于**简单的运算**
  - 在模板中放入太多的逻辑会让**模板过重和难以维护**
  - 并且如果多个地方都使用到，那么会有大量重复的代码
- 使用何种方式将逻辑抽离出去？
  - 其中一种方式就是将逻辑抽取到一个`method`中，放到 methods 的 options 中。但是，这种做法有一个直观的弊端，就是所有的 data 使用过程都会变成了一个**方法的调用**
  - 另外一种方式就是使用计算属性 **computed**；

## 初识计算属性 computed

1. 什么是计算属性？官方并没有给出直接的概念解释；而是说：对于任**何包含响应式数据的复杂逻辑**，你都应该使用**计算属性** **计算属性**将被混入到组件实例中。所有 getter 和 setter 的 this 上下文自动地绑定为组件实例；
2. 计算属性的用法选项：`computed` 类型：`{ [key: string]: Function | { get: Function, set: Function } }`

### 案例实现思路

我们来看三个案例：

- **案例一：** 我们有两个变量：firstName 和 lastName，希望它们拼接之后在界面上显示；
- **案例二：** 我们有一个分数：score
  - 当 score 大于 60 的时候，在界面上显示及格；
  - 当 score 小于 60 的时候，在界面上显示不及格；
- **案例三：** 我们有一个变量 message，记录一段文字：比如 Hello World
  - 某些情况下我们是直接显示这段文字；
  - 某些情况下我们需要对这段文字进行反转；
- 我们可以有三种实现思路：
  - **思路一：** 在模板语法中直接使用表达式；
  - **思路二：** 使用 method 对逻辑进行抽取；
  - **思路三：** 使用计算属性 computed；

### 思路一：模板语法

```html
<div id="app">
  <h2>{{ firstName + lastName }}</h2>
  <h2>{{ score >= 60 ? "及格":"不及格" }}</h2>
  <h2>{{ message.split("").reverse().join("") }}</h2>
</div>
<script>
  data() {
    return {
      firstName: "李",
      lastName: "狗蛋",
      score: 75,
      message: "你好啊！",
    };
  },
</script>
```

> 缺点一：模板中存在大量的复杂逻辑，不便于维护（模板中表达式的初衷是用于简单的计算）。缺点二：当有多次一样的逻辑时，存在重复的代码。缺点三：多次使用的时候，很多运算也需要多次执行，没有缓存。

### 思路二：method 实现

```html
<div id="app">
  <h2>{{ getFullName() }}</h2>
  <h2>{{ getResult() }}</h2>
  <h2>{{ getFullName() }}</h2>
</div>
<script>
  data() {
    return {
      firstName: "李",
      lastName: "狗蛋",
      score: 75,
      message: "你好啊！",
    };
  },
  methods: {
    getFullName() {
      return this.firstName + this.lastName;
    },
    getResult() {
      return this.score >= 60 ? "及格" : "不及格";
    },
    getReverseMsg() {
      return this.message.split("").reverse().join("");
    },
  },
</script>
```

> 缺点一：我们事实上先显示的是一个结果，但是都变成了一种方法的调用，且此类代码过多会提高代码的复杂度和难以维护性。缺点二：多次使用方法的时候，没有缓存，也需要多次计算

### 思路三：computed 实现

```html
<div id="app">
  <h2>{{ fullName }}</h2>
  <h2>{{ result }}</h2>
  <h2>{{ reverseMsg }}</h2>
</div>
<script>
   data() {
    return {
      firstName: "李",
      lastName: "狗蛋",
      score: 75,
      message: "你好啊！",
    };
  },
  computed: {
    fullName() {
      return this.firstName + this.lastName;
    },
    result() {
      return this.score >= 60 ? "及格" : "不及格";
    },
    reverseMsg() {
      return this.message.split("").reverse().join("");
    },
  },
</script>
```

> 注意：计算属性看起来像是一个函数，但是我们在使用的时候不需要加()，可以看做一个已经调用过的函数，得到的相当于 data 中的值。我们会发现无论是直观上，还是效果上计算属性都是更好的选择。并且 **计算属性是有缓存** 的。

### computed VS methods

```html
<div id="app">
  <h2>{{ getFullName() }}</h2>
  <h2>{{ getFullName() }}</h2>
  <h2>{{ getFullName() }}</h2>
  <h2>{{ fullName }}</h2>
  <h2>{{ fullName }}</h2>
  <h2>{{ fullName }}</h2>
</div>
<script>
  data() {
    return {
      firstName: "李",
      lastName: "狗蛋",
    };
  },
  computed: {
    fullName() {
      console.log("调用了computed中的fullName");
      return this.firstName + this.lastName;
    },
  },
  methods: {
    getFullName() {
      console.log("调用了methods中的getFullName");
      return this.firstName + this.lastName;
    },
  },
</script>
```

![结果](https://jsonq.top/cdn-static/2025/02/25/1740465700682-20z04uvn.jpg)

由图可得：渲染同样个数多个标签，`methods`调用了 3 次，而`computed`只调用了 1 次，区别就在于**计算属性的缓存**。

### 计算属性的缓存

1. 这是因为计算属性会基于它们的**依赖关系进行缓存**
2. 在**数据不发生变化**时，计算属性是**不需要重新计算**的
3. 但是如果**依赖的数据发生变化**，在使用时，计算属性依然**会重新进行计算**

![对比](https://jsonq.top/cdn-static/2025/02/25/1740465700811-5uduifg7.jpg)

### 计算属性的 setter 和 getter

计算属性在大多数情况下，只需要一个 **getter 方法**即可，所以我们会将计算属性直接**写成一个函数**

```js
computed: {
    fullName() {
      return this.firstName + this.lastName;
    },
  },
```

但是想设置计算属性的值呢，也可以给计算属性设置一个 **setter 的方法**，此时要写成**对象**格式。

```js
computed: {
  fullName: {
    get() {
      console.log("getter");
      return this.firstName + "0" + this.lastName;
    },
    set(value) {
      const name = value.split("0");
      console.log(value, name);
      this.firstName = name[0];
      this.lastName = name[1];
    },
  },
},
```

# 侦听器 watch

## 使用 watch

在某些情况下，我们希望在**代码逻辑**中监听某个数据的变化，需要用**侦听器 watch**来完成。即，当某个**数据发生变化**时，我们需要根据这个数据的最新值去做出一些**响应操作**，比如：搜索框。侦听器用法：选项：`watch` 类型：`{ [key: string]: string | Function | Object | Array}`

```html
<div id="app">
  <label for="question">请输入问题：</label>
  <input type="text" id="question" v-model="question" />
</div>
<script>
  data() {
    return {
      question: null,
    }
  }
  watch: {
    // question 就是需要侦听的变量
    question(newV, oldV) {
      console.log("newV：" + newV, "oldV：" + oldV);
      this.getAnwser(newV);
    },
  },

  methods: {
    getAnwser(question) {
      console.log(`问题是：${question}。正在请求后台数据...`);
    },
  },
</script>
```

![结果](https://jsonq.top/cdn-static/2025/02/25/1740465700925-9k1krqpi.jpg)

> `watch`内部的监听的函数会接收到两个值，第一个是监听的值的**最新值**，第二个是监听的值的**上一次的值**

## watch 的配置选项

> [!WARNING] 当我们点击按钮的时候会 **修改 info.name** 的值；我们使用 **watch 来侦听 info**， 可以侦听到吗？ 答案是 **不可以**。

- 默认情况下，**watch 只是在侦听 info 的引用变化**，对于**内部属性的变化是不会做出响应的**：
  - 这个时候我们可以使用一个**选项 deep** 进行更**深层的侦听**；
  - watch 里面侦听的属性对应的也可以是一个 Object；
- 还有**另外一个属性**，是**希望一开始的就会立即执行一次**：
  - 这个时候我们使用 `immediate` 选项；
  - 这个时候无论后面数据是否有变化，侦听的函数都会有限执行一次；

```js
watch:{
  info: {
    hanlder(newV, oldV){
      console.log(newV, oldV)
    },
    deep: true,  // 开启深度监听
    immediate: true  // 首次加载立即执行一次
  },
  // 侦听对象的属性
  "info.name": function(newV, oldV){
    console.log(newV, oldV)
  }
}
```

## watch 的其它侦听方式

1. 在 `watch` Option API 中的其它监听方式使用

```js
data() {
  return {
    a: "字符串方法名",
    b: "数组格式的侦听",
  };
},
watch: {
  a: "someMethod", // 字符串方法名称
  // 你可以传入回调数组，它们将会被逐一调用
  b: [
    "handle1",
    function handle2(val, oldVal) {
      console.log("b 的 handle2 触发");
    },
    {
      handler: function handle3(val, oldVal) {
        console.log("b 的 handle3 触发");
      },
      /* ... */
    },
  ],
},

methods: {
  someMethod(question) {
    console.log("a 改变了");
  },
  handle1() {
    console.log("b 的 handle1 触发");
  },
},
```

2. `$watch`

我们可以在`created`的生命周期中，使用 `this.$watch` 来侦听；

- 第一个参数是要侦听的源；
- 第二个参数是侦听的回调函数 `callback`
- 第三个参数是额外的其他选项，比如 `deep、immediate`

```js
created(){
  this.$watch('message', (newV, oldV) => {
    console.log(newV, oldV)
  },{deep: true, imediate: true})
}
```
