---
title: Sass 语法
date: 2024-10-23
---

Why Not less？

感觉 scss 语法更贴近 js 的语法，更易于阅读。

# 简单使用 scss

在 vscode 扩展中安装 `Live Sass Compiler`，在文件夹下新建 `.vscode/settings.json` 配置文件（为了不污染全局的配置），写入内容如下：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  // scss setting config
  "liveSassCompile.settings.formats": [
    {
      "format": "expanded",
      "extensionName": ".css",
      "savePath": "~/../css",
      "savePathReplacementPairs": null
    }
  ],
  "liveSassCompile.settings.autoprefix": ["> 1%", "last 2 versions"],
  "liveSassCompile.settings.generateMap": false
}
```

此时项目的目录如下

```yml
- css
- scss
- index.html
```

点击 vscode 右下角的 `Watch Sass`，然后在 scss 文件夹下的 scss 保存时都会自动生成对应的 css 在 css 文件夹下，由于配置了 `autoprefix` 还会生成兼容代码。

# sass 基础语法

## 嵌套语法

1. 嵌套选择器/css 属性

不仅支持常规的 css 选择器嵌套，还支持 css 属性语法嵌套

原始 css 写法

```css
.container a {
  color: #000;
  font-size: 14px;
  font-weight: 700;
}
```

scss 写法

```scss
.container {
  a {
    color: #000;
    // 嵌套的属性，生成就是 font-size: 14px; font-weight: 700;
    font: {
      size: 14px;
      weight: 700;
    }
  }
}
```

2. 嵌套时的占位符

以 `%` 开头为占位符，使用 `@extend` 引入，它不会直接引入到对应的 css 选择器下，而是将 css 选择器填充到 `%` 的内容中，**感觉应用场景不多，不如直接 `@mixin + @include`**。

比如 `.my%placeholder{...}`，使用时 `.a{ @extend %placeholder; }` ，则会生成 `.my.a{...}`

![example.png](https://static.jsonq.top/2024/10/18/160803983_97ee266e-7b4f-4b22-8d5a-f6300fbc42ad.png)

3. 嵌套时的父选择器 `&` 使用和 less 一致

```scss
a {
  &:hover {
    color: #1677ff;
  }
}
```

## 变量

### 变量命名

scss 中类 cssvar 的变量命名，统一使用 $ 符号，比如 `$color-primary: #1677ff;`，

```scss
$color-primary: #1677ff;

a {
  color: $color-primary;
}

// 跟 cssvar 使用相似，不过更简便

:root {
  --color-primary: #1677ff;
}

a {
  color: var(--color-primary);
}
```

> scss 的变量命名注意事项：
>
> - 相同的变量名后者覆盖前者
> - 变量名的连接符 `-` 等于下划线 `_`，例如 `$border-color` 和 `border_color` 其实是一个变量，但是推荐连接符 `-`。

### 变量作用域

- 选择器内部定义只能在选择器及其子集内使用，即区分**局部变量**和**全局变量**，优先局部变量，和 js 作用域类似。
- 局部变量转成全局变量，使用 `!global` 即可

```scss
a {
  $font-size: 14px !global;
  font-size: $font-size;
}

p {
  // 这里是可以访问到 a 选择器中定义的 $font-size ，因为已经转成了全局变量
  font-size: $font-size;
}
```

### 变量值

#### 多种变量值格式及使用

scss 支持的变量值如下：

- 数字：1, 2, 3, 10px
- 字符串：有引号字符串和无引号字符串，"hello", "world", hello
- 颜色：blue, #fff, rgba(255,255,255,0.5)
- 布尔值：true, false
- 空值：null
- 数组：用空格或逗号做分隔符，`1em 1em 0.2em`，`1em, 1em, 0.2em`，正常写 margin padding 就是第一种写法
- maps 相当于 JS 中的 object，(key1: value1, key2: value2)

```scss
$layer-index: 10;
$border-width: 3px;
$font-base-family: 'Helvetica', Arial, sans-serif; // 引号与无引号
$top-bg-color: rgba(255, 255, 255, 0.5);
$block-base-padding: 6px 10px 8px 12px; // list
$blank-mode: true;
$var: null; // null 值是其类型的唯一值，不能用于 css 属性值。通常由函数返回以只是缺少结果

$color-map: (
  color1: #fff,
  color2: #000,
  color3: #ccc,
);
$fonts: (
  serif: 'Helvetica',
  monospace: 'Consolas',
);
```

比较特殊的几个变量简单使用如下

```scss
.container {
  @if $blank-mode {
    background-color: #fff;
  } @else {
    background-color: #000;
  }

  content: type-of($var);
  content: length($var);
  color: map-get($color-map, color1);
}

.wrap {
  // 如果 map 中取出的值为空值，则 css 会忽略掉这个属性
  font: 16px bold map-get($fonts, 'sans');
}
```

#### 默认值 !default

默认值，如果变量没有被定义，则使用默认值，否则使用变量值。

```scss
$color-primary: #1677ff !default;
```

# 指令

## @use 引用指令

scss 在以前版本是使用 `@import` 导入 scss 文件，和 css 的 `@import` 一样，但是现在推荐使用 `@use`，因为 `@import` 会把所有变量、函数、mixin 全部引入，而 `@use` 只引入需要的变量、函数、mixin。

![@use 说明](https://static.jsonq.top/2024/10/18/160804270_4ef4faba-5ca7-4309-92e5-acd91c0307c1.png)

在使用 `@use` 的时候，如果变量、函数、mixin 重名了，会报错，所以需要使用 `as` 关键字来重命名，通常情况下，在编写样式表时才 `as *`。

```scss
@use 'common/var' as *;
@use 'mixins/var' as *;
```

- `@use` 导入时，如果文件名带下划线 \_，也可以导入不带下划线，例如 `_var.scss` 就可以在使用时 `@use "var"`，但是**下划线开头通常是 minix 文件**
- 更多 `@use` 和 `@import` 相关语法可见：https://sass.nodejs.cn/documentation/at-rules/use/#google_vignette

## @mixin 混入值

### 无参数基本使用

```scss
@mixin block {
  display: block;
  width: 100%;
  height: 100%;
}

.container {
  // 如果 @minix 没有参数，可以直接 @include block; 也可以空参函数调用 @include block();
  @include block;
  border: 1px solid red;
}
```

生成的 css

```css
.container {
  display: block;
  width: 100%;
  height: 100%;
  border: 1px solid red;
}
```

### 传参使用

用法其实和 js 的函数调用基本一样，思想是一样的，只不过无参 @minix 可以不调用，省略括号。

```scss
@mixin color-mixin($color, $bg-color) {
  color: $color;
  background-color: $bg-color;
}

.wrapper {
  @include color-mixin(#fff, #f00);
}

// 对应 css
.wrapper {
  color: #fff;
  background-color: #f00;
}
```

> minix 函数接收的参数，**在使用时，必须传入**，如果确实存在不需要的情况，可以传入 `null`，这样 scss 在编译时就会不会生成对应的代码。

#### 传入的参数为 null

参数为 null 时，对应的属性不会被编译（即不生成该属性代码）

```scss
@mixin color-mixin($color, $bg-color) {
  color: $color;
  background-color: $bg-color;
}

.wrapper {
  @include color-mixin(null, #f00);
}

// 对应生成的 css 代码
.wrapper {
  background-color: #f00;
}
```

#### 指定参数名传入

当手动指定参数名传入时，可以不按照参数顺序传入。

```scss
@mixin color-mixin($color, $bg-color) {
  color: $color;
  background-color: $bg-color;
}

.wrapper {
  @include color-mixin($bg-color: #f00, $color: #e6e6e6);
}

// 生成的 css
.wrapper {
  color: #e6e6e6;
  background-color: #f00;
}
```

#### 设置参数默认值

- 跟 js 设置默认值类似。**注意：** 如果传入 `null`，默认值不会生效。

```scss
@mixin color-mixin($color: blue, $bg-color: red) {
  color: $color; //  default: blue
  background-color: $bg-color; //  default: red
}

.wrapper {
  @include color-mixin();
}

// 生成的 css 代码
.wrapper {
  color: blue;
  background-color: red;
}
```

- 如果传入参数主动传入 `null`，则对应的属性不会被编译生成

```scss
@mixin color-mixin($color: blue, $bg-color: red, $padding-top: 1px) {
  color: $color;
  background-color: $bg-color;
  padding-top: $padding-top;
}

.wrapper {
  // null 对应的属性不会被编译生成
  @include color-mixin(null, #f00, 3px);
}
// 生成的 css 代码
.wrapper {
  background-color: #f00;
  padding-top: 3px;
}
```

#### 可变参数 args

和 js 的扩展运算符类似，只不过 scss 是 `$restProps...` 而 js 是 `...restProps`，此处以线性渐变为例，渐变可以有很多不去确定的颜色传入。

```scss
@mixin linear-gradient($direction, $gardients...) {
  background-color: nth($gardients, 1);
  background-image: linear-gradient($direction, $gardients);
}

.container {
  @include linear-gradient(to bottom, #f00, #0f0, #00f);
}

// 生成的 css 代码
.container {
  background-color: #f00;
  background-image: linear-gradient(to bottom, #f00, #0f0, #00f);
}
```

> `nth` 顾名思义就是找 `$gardients` 的第一个参数作为值，且 `$gardients` 所有参数都作为渐变值传入

## @extend 继承

哪几个 css 用到了 `@extend`，scss 就会把这几个 css 类名放在一起，继承的样式在内部。**通常情况下 @extend 需要继承的样式块会以占位名称命名，即 `%` 开头的名称**，适用于非常常用的静态样式，动态样式使用 `@mixin`，非常用样式反而会降低维护性。

```scss
%size {
  width: 100%;
  height: 100%;
}

.flex-box {
  display: flex;
  @extend %size;
}

.block-box {
  display: block;
  @extend %size;
}
```

生成的 css 代码，其中 `%size` 的样式被提取出来，并应用到 `.block-box` 和 `.flex-box` 上。

```css
.block-box,
.flex-box {
  width: 100%;
  height: 100%;
}

.flex-box {
  display: flex;
}

.block-box {
  display: block;
}
```

# 运算符

## 等号运算符

等号运算符 `=` `!=`

```scss
$theme: 'dark';

body {
  @if $theme == 'dark' {
    background-color: #000;
  } @else {
    background-color: #fff;
  }
}

// 生成的 css 代码
body {
  background-color: #000;
}
```

## 比较运算符

比较运算符 `>` `>=` `<` `<=`，只能用作简单的 px，数字，百分比及小数比较，字符串无法对比。

```scss
// $resize-width: 50%;
// $resize-width: 0.5;
// $resize-width: 800px; // css px em 等等像素单位
$resize-width: 800;

body {
  @if $resize-width >= 1200 {
    background-color: red;
  } @else if $resize-width >= 800 {
    background-color: green;
  } @else {
    background-color: blue;
  }
}

// 生成的 css 代码
body {
  background-color: green;
}
```

## 逻辑运算符

逻辑运算符 `and` `or` `not`，且 / 或 / 否

```scss
$width: 400px;
$height: 200px;
$t: 'dark';

body {
  @if $width>100 and $height>50 {
    font-size: 16px; // 满足
  } @else {
    font-size: 14px;
  }

  @if not $t== 'dark' {
    border-color: red;
  } @else {
    border-color: blue; // 满足
  }
}

// 生成的 css 代码
body {
  font-size: 16px;
  border-color: blue;
}
```

## 数字运算符

运算符 `+` `-` `*` `/` `%`，其中 `%` 是取余运算，`/` 是整除运算。

可使用数字运算符的有纯数字，百分比，css 单位（px pt 等），可使用类型和 [比较运算符](#比较运算符) 一致。

```scss
.container {
  //  +
  width: 10 + 70%; // 70%
  width: 10% + 70%; // 80%
  width: 10px + 70px; // 80px
  width: 10 + 70px; // 80px
  width: 10px + 1pt; // 11.3333333333px;

  // -
  width: 10 - 70%; // -60%
  width: 10% - 70%; // -60%
  width: 10px - 70px; // -60px
  width: 10 - 70px; // -60px
  width: 10px - 1pt; // 8.6666666667px

  // *
  width: 10 * 70%; // 700%;
  width: 10 * 70; // 700;
  // width: 10% * 70%;   // 报错
  width: 10 * 70px; // 700px;
  // width: 10px * 70px; // 报错
  // width: 10px * 1pt; // 报错

  // -
  $width: 10;
  width: 10 / 70; // 10/70; 不会被运算
  width: (10 / 70); // 0.1428571429;
  width: $width / 70; // 0.1428571429;
  // width: (10 / 70px); // 报错
  width: (10px / 70); // 0.1428571429px;
  width: (10px / 70px); // 0.1428571429;
  width: 10px + 30px / 3px; // 20px;
  width: random(8) / 2; // 随机数[1 - 8] / 2

  // %
  width: 9% % 4%; // 1%;
  width: 9% % 4; // 1%;
  width: 9 % 4px; // 1px;
  width: 9px % 4; // 1px;
  width: 9px % 4px; // 1px;
  width: 9px % 4pt; // width: 3.6666666667px;
}
```

- 加减运算符
  - 数字与百分比运算，数字会被转换成百分比再计算
  - 数字与带 css 单位的数字运算，最终结果是数字运算并保留 css 单位
  - 同单位的 css 单位数字运算，同上
  - 不同单位的 css 单位数字运算，会先转成 px 再运算。`em rem` 这些相对单位无法运算
- 乘除运算符
  - 数字和数字，数字和百分比，直接相乘，正常算术运算
  - 两个运算都带单位符号（`px pt` `px %` `% %`）的无法相乘，例如 `10% * 70%` 和 `10px * 70px` 会报错
- 除法运算符（三种情况下 / 才会被视为除法运算符）
  - 值或值的一部分是**变量或者函数的返回值**，即需要有变量参与，例如 `$width / 2`
  - 值被圆括号 `()` 包裹，例如 `(10px / 2)`
  - 值是算术表达式的一部分，即有两个以上的运算符，例如 `10 * 30 / 3` 就可以计算，但是 `30 / 3` 就不行
  - 数字与单位相除时，单位必须在前边，在后边会报错
- 取余运算符
  - 数字与百分比取余，结果依旧会转成百分比
  - 带 css 单位的与数字取余，结果保留 css 单位

## 字符串拼接

结论：生成的结果最终和左侧保持一致，左侧是带引号的，结果就带引号，左侧不带引号，结果就不带引号。

```scss
.container {
  font-family: 'Courier' + New; // "CourierNew";
  font-family: Courier + 'New'; // CourierNew;
  font-family: 'Courier' + 'New'; // "CourierNew";
  font-family: Courier + New; // CourierNew;
}
```

# 插值语句

## 插值语句基本应用

插值语句 `#{}` 可以在插入，选择器、属性名、属性值、注释。

```scss
$class-name: danger;
$attr: color;
$author: '张三';
$tag: a;

/*
  @author: #{$author} 
*/
#{$tag}.#{$class-name} {
  border-#{$attr}: #f00;
}
```

编译成的 css

```css
/*
  @author: 张三 
*/
a.danger {
  border-color: #f00;
}
```

# scss 常见函数

## 颜色亮暗及透明度

颜色函数 `lighten` `darken` `alpha` `opacity`

```scss
$base-color: #1677ff;
// 让颜色变浅（亮）
.color-light {
  background-color: lighten($base-color, 20%);
}

// 让颜色变深（暗）
.color-dark {
  background-color: darken($base-color, 20%);
}

$base-color: #1677ff;
.color-base {
  background-color: $base-color;
}
// 让颜色变浅（亮）
.color-light {
  background-color: lighten($base-color, 20%);
}
// 让颜色变深（暗）
.color-dark {
  background-color: darken($base-color, 20%);
}
// 让透明度增加，透明度最多 1，原本 0.2 透明，在加 0.3 透明度
// rggba(base-color, 0.2)
.color-opacify {
  background-color: opacify(rgba($base-color, 0.1), 0.1);
}
// 让透明度减少，最少减为 0
// rgba(base-color, 0.5)
.color-transparentize {
  background-color: transparentize(rgba($base-color, 1), 0.5);
}
```

![色调示例](https://static.jsonq.top/2024/10/18/160808626_3c77d050-d376-489f-ab76-4466085507bb.png)
