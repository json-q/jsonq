---
title: TS 面向对象
date: 2024-04-30
---

# TS 面向对象

## 类的使用

**类的基本使用**

```ts
class Person {
  // 在 TS 中，初始化的值必须进行声明
  name: string;
  age: number = 0; // 默认值
  constructor(name: string, age: number) {
    // 在 js 中是没问题的，在 ts 中：类型“Person”上不存在属性“name”
    this.name = name;
    this.age = age;
  }

  coding() {
    // 方法中的 this 会根据上下文进行推导
    console.log(this.name + 'coding');
  }
}

const p = new Person('张三', 18);
console.log(p.name, p.age);
```

**类的成员修饰符**

- `public` 修饰的是在任何地方可见、公有的属性或方法，**默认编写的属性就是`public`的**
- `private` 修饰的是仅在同一类中可见、私有的属性或方法；
- `protected` 修饰的是仅在类自身及子类中可见、受保护的属性或方法；

```ts
class Person {
  name: string;
  private age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  protected coding() {
    // private 修饰的只能在自己类内部访问，外界无法访问
    console.log(this.name + 'coding', this.age);
  }
}

// new实例化的既不属于类本身，也不属于子类，protected 修饰的成员变量无法访问
const p = new Person('张三', 18);
// private: 属性“age”为私有属性，只能在类“Person”中访问。
// protected: 属性“coding”受保护，只能在类“Person”及其子类中访问
console.log(p.name, p.age, p.coding());

class Girl extends Person {
  song() {
    // 子类中可以访问 protected 修饰的
    console.log(this.coding());
  }
}
```

**只读属性 readonly**  
字面意思，`readonly` 修饰的成员变量只读，无法更改

```ts
class Person {
  readonly name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

const p = new Person('张三', 18);
p.age = 20;
// 无法为“name”赋值，因为它是只读属性
p.name = '李四';
```

**getters/setters**

- 私有属性是不能直接访问的
- 当某些属性需要监听它的获取(getter)和设置(setter)的过程，对其**进行拦截**，过滤一些非法操作，这时可以使用存取器。

```ts
class Person {
  // 开发规范：通常私有属性的前方会使用 _ 开头
  private _name: string;
  private _age: number;
  constructor(name: string, age: number) {
    this._name = name;
    this._age = age;
  }

  set name(newV: string) {
    this._name = newV;
  }

  // set 可以对参数进行拦截，处理业务
  set age(newV: number) {
    if (newV < 0) console.log('age 不能小于0');
    this._age = newV;
  }

  get age() {
    return this._age;
  }
}

const p = new Person('张三', 20);
// 没有提供 name 的 set，是无法设置上值的
console.log(p.name, p.age); // undefined 20
```

**参数属性**

- TypeScript 提供了特殊的语法，可以把一个构造函数参数转成一个同名同值的类属性
- 使用特殊语法，必须在**构造函数前方使用可见性修饰符**，包括 `public`

```ts
// 正常情况下，创建一个类，需要声明属性类型，并将参数传入 constructor 中进行赋值
class Person {
  private _name: string;
  private _age: number;
  constructor(name: string, age: number) {
    this._name = name;
    this._age = age;
  }
  // ...
}

// TS 提供的语法糖可以直接在 constructor 中声明并传入参数赋值
// 参数前方必须使用显式修饰符
class Person {
  constructor(
    public name: string,
    private _age: number,
  ) {}
  // ...
}
```

> 在构造函数参数前**必须添加一个可见性修饰符 `public` `private` `protected` 或者 `readonly` 来创建参数属性**，最后这些类属性字段也会得到这些修饰符

## 抽象类 abstract

- 抽象类是**不能被实例化**的（也就是不能通过 new 创建）
- 抽象类可以包含抽象方法，也可以包含有实现体的方法
- 有抽象方法的类，必须是一个抽象类
- 抽象方法**必须被子类实现**，否则该类必须是一个抽象类

_例子_：实现一个通用函数，来计算 矩形、圆形、三角形的面积

```ts
class Rectangle {
  constructor(
    public width: number,
    public height: number,
  ) {}

  getArea() {
    return this.width * this.height;
  }
}

class Circle {
  constructor(public radius: number) {}

  getArea() {
    return Math.PI * this.radius ** 2;
  }
}

// 每声明一个新的计算方法，就需要在 shape 中新增一个类型
function calcArea(shape: Rectangle | Circle) {
  // 调用实例上的计算面积函数
  return shape.getArea();
}

calcArea(new Rectangle(1, 2));
```

> **弊端**：每声明一个新的计算面积的类，就需要在公共函数的参数中新增该类的类型，当类型特别多的情况下，会造成重复操作过多

_使用 abstract 改造_

```ts
abstract class Shape {
  // getArea 只有声明，没有实现体，实现体由子类实现
  // 可以增加 abstract 使其成为抽象类
  abstract getArea();
}
class Rectangle extends Shape {
  constructor(
    public width: number,
    public height: number,
  ) {
    super();
  }

  getArea() {
    return this.width * this.height;
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super();
  }

  getArea() {
    return Math.PI * this.radius * this.radius;
  }
}

// 使用抽象类，可以不改动源代码，声明时继承父类即可
function calcArea(shape: Shape) {
  return shape.getArea();
}

calcArea(new Rectangle(1, 2));
```

> 通俗来说，父类只提供一个声明而不实现，该方法的实现交给子类处理

### 类型检测（鸭子类型）

- TypeScript 对于类型检测的时候使用的是**鸭子类型**
- 鸭子类型：如果一只鸟，走起来像鸭子，游起来像鸭子，那么你可以认为它就是一直鸭子
- 鸭子类型，只关心属性和行为，不关心具体是不是对应的类型

```ts
class Person {
  constructor(
    public name: string,
    public age: number,
  ) {}
}

class Cat {
  constructor(
    public name: string,
    public age: number,
  ) {}
}

function getPerson(p: Person) {
  console.log(p.name, p.age);
}

getPerson(new Person('张三', 18));
getPerson({ name: '李四', age: 20 });
// 接收 Person 类型，传入 Cat 类型不报错
getPerson(new Cat('狸花', 2));

// Cat 类型赋给了 Person 类型
const person: Person = new Cat('折耳', 1);
```

### 类的类型

- 可以创建类对应的实例对象
- 类本身可以作为这个实例的类型
- 类额可以当做一个有构造签名的函数

```ts
class Person {}

/**
 * 类的作用：
 * 1、可以创建类对应的实例对象
 * 2、类本身可以作为这个实例的类型
 * 3、类额可以当做一个有构造签名的函数
 */

const p: Person = new Person();

function getPerson(p: Person) {}

// 构造签名
// interface IPerson {
//   new (): Person;
// }
function factory(ctor: new () => void) {}
factory(Person);
```

## 对象类型

**对象类型的修饰符**  
用法和`iterface`一致

```ts
type Person = {
  name?: string;
  readonly age: number;
};
```

**接口的继承**

- 接口和类一样是可以进行继承的，也是使用`extends`关键字
- 接口是支持多继承的，而类不支持

```ts
interface Person {
  name: string;
  age: number;
}

// 如果使用第三方库，又需要自定义接口拥有第三方的某些类型中的所有属性，则可以使用 extends
interface Coder extends Person {
  coding: () => void;
}

const coder: Coder = {
  name: '码农',
  coding() {},
  age: 18,
};
```

**接口中类的实现**

- 使用 `implements` 可以进行多个类的类型的实现
- 与 `extends` 不同的是，`implements` 在实现类时，必须将所有实现的类的类型都进行声明

```ts
interface Cat {
  name: string;
  age: number;
  goTree: () => void;
}

interface Dog {
  watchHome: () => void;
}

class Animal implements Cat, Dog {
  name: string;
  age: number;
  constructor(/*...*/) {
    /*...*/
  }
  goTree() {}
  watchHome() {}
}

const a = new Animal();
console.log(a.name, a.watchHome());
```

**严格的字面量赋值检测**

对于对象的字面量赋值，在 TypeScript 中有一个非常有意思的现象

![严格的字面量赋值检测](https://jsonq.top/cdn-static/2025/02/25/1740465694055-p566ssg1.jpeg)

- 官方 Issue 回复：
  - 每个对象字面量最初都被认为是“新鲜的（fresh）”，对于“新鲜的”是**有严格的字面量检测**。
  - 当一个新的对象字面量分配给一个变量或传递给一个非空目标类型的参数时，对象字面量指定目标类型中不存在的属性是错误的。
  - 当类型断言或对象字面量的类型扩大时，新鲜度会消失

> 采用这种方式来进行检测，可能是为了更灵活的使用 TS 变量

**枚举类型**

- 枚举其实就是将一组可能出现的值，一个个列举出来，定义在一个类型中
- 枚举允许开发者定义一组命名常量，常量可以是`string`、`umber`类型

```ts
enum Direction {
  // 默认值分别从上到下为 0、1、2、3
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
}

enum Direction {
  // 此时默认值分别是从上到下为 0、100、101、102
  LEFT,
  RIGHT = 100,
  TOP,
  BOTTOM,
}

enum Direction {
  // 如果某一个枚举是字符串类型，那么从该枚举之后的所有类型，都需要初始化，除非再次初始化值为 number 类型
  LEFT,
  RIGHT,
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  LEFT_TOP = 10,
  LEFT_BOTTOM,
}

enum Opration {
  // 这种写法是二进制 0001 把 1 往前移动 2 位 ==> 0100 最终结果是 4
  READ = 1 << 2,
}
```

> 默认的枚举值是从 0 开始依次递增，若枚举值为字符串，则后续必须有具体值，TS 无法推测字符串的递增值

### 索引签名

**对象的索引签名理解**

- 不能提前知道一个类型里的所有属性的名字，但是知道这些值的特征；
- 这种情况，可以用一个索引签名 (index signature) 来描述可能的值的类型

```ts
interface InfoType {
  // 索引签名：可以通过字符串索引，去获取到一个值，这个值也是字符串
  [key: string]: string;
}

function getInfo(): InfoType {
  const info: any = {};
  return info;
}

const info = getInfo();
console.log(info.name, info['age']);

// 案例
interface CollectType {
  [key: number]: string;
  length: number;
}

function getCollect(col: CollectType) {
  // col 身上有 length 属性
  for (let i = 0; i < col.length; i++) {
    // 拿到的 item 一定是 string 类型
    const item = col[i];
  }
}

const tuple: [string, string] = ['张三', '李四'];
```

> 官方文档：索引签名的属性类型只能是 `string` | `number` 中的**其中一个类型**

**索引签名-类型问题**

```ts
interface IndexType {
  // 返回值类型的目的是告知通过索引去获取到的值是什么类型
  // [idex:number]:string
  // [index: string]: any;
  [index: string]: string;
}

// 索引签名：[idex:number]:string  没有报错（正常） names[0]: "张三"
// const names:IndexType = ["张三","李四","王五"]

// 索引签名：[index: string]: any;  没有报错 names[0]："张三"
// names[0] ==> names["0"]  这是 JS 的特性，就算写数字，也会被当做字符串
// const names: IndexType = ["张三", "李四", "王五"];

// 索引签名：[index: string]: string;  报错
// 严格字面量赋值检测：[...] ==> Array 实例 ==> names[0]、names.forEach
const names: IndexType = ['张三', '李四', '王五'];

// names.forEach 返回的是一个 function ，不符合返回值 string
names.forEach;
```

**两个签名**

```ts
interface IndexType {
  // 两个索引类型的写法
  // [index: number]: string;
  // [key: string]: any;

  // 该写法不被允许
  // 数字类型索引 [index: number] 的类型，必须是字符串索引 [key: string] 的类型的 “子类型”
  // 原因：所有的 number 类型索引最终都会被转成 string 类型去获取值
  /* [index:number]:number|string;
  [key:string]:number */

  [index: number]: string;
  [key: string]: number | string | boolean;
  isMale: boolean;
}

const names: IndexType = ['张三', '李四', '王五'];
```

> - 当有两个签名时，数字类型的值类型必须是比字符串类型的值类型更加确定的类型（需要是字符串类型的子类型）
> - 如果索引签名中有定期其它属性，其它属性返回的类型，必须符合 `string` 类型返回的属性
