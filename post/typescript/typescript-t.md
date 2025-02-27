---
title: TS 泛型及类型体操
date: 2024-05-02
---

# TS 泛型认知

- 封装一个函数，传入一个参数，并且返回这个参数
  - 如果使用 `any`，就失去了类型限制
  - 如果写死参数和返回值，会造成其它类型的参数无法传入，且扩展性基本没有

## 泛型的基本使用

**类型参数化**

```ts
function foo<Type>(arg: Type): Type {
  return arg;
}

// const s: string
const s = foo<string>('abc');

// const n: number[]
const n = foo<number[]>([1, 2, 3]);

// 省略写法  不传类型，直接推导传入的参数作为具体的类型
// const unk: 1200
const unk = foo(1200);
```

**多泛型传入**

```ts
function foo<T, O>(arg1: T, arg2: O): { a: O; b: T } {
  return {
    a: arg2,
    b: arg1,
  };
}
```

**泛型接口使用**

```ts
interface Person<T, S> {
  name: string;
  age: number;
  sex: S;
  hobby: T;
}

interface HobbyType {
  song: string;
  jump: string;
}

const p: Person<HobbyType, string> = {
  name: '张三',
  age: 20,
  sex: '男',
  hobby: { song: '唱', jump: '跳' },
};
```

**泛型类的使用**

```ts
class Person<S = string, N = number> {
  constructor(
    public name: S,
    public age: N,
  ) {}
}

// const p = new Person("张三",18)

const p = new Person<number, string>(10, '张三');
```

> - `T`：Type 的缩写，类型
> - `K、V`：key 和 value 的缩写，键值对
> - `E`：Element 的缩写，元素
> - `O`：Object 的缩写，对象

## 泛型约束

正传入的泛型 T 是无法控制传入的内容的，如果需要既保留传入的类型，又需要限制传入的类型上必须有某些属性，可以使用类型约束。使用 `extends` 来对传入的泛型进行约束

**简单使用**

```ts
// 这种传入方式，无法限制传入的参数中必须存在的属性
function getInfo<T>(args: T): T {
  return args;
}

// -------------必须保证传入的参数中有 length 属性-----------------------
interface Length {
  length: number;
}

function getInfo<T extends Length>(args: T): T {
  return args;
}

getInfo('aaa');
getInfo([1, 2]);
// 类型 "{}" 中缺少属性 "length"，但类型 "Length" 中需要该属性。
// getInfo({});
```

**泛型参数使用约束**

使用 `keyof` 来保证不会获取到对象中不存在的属性

```ts
// keyof 的使用
interface Person {
  name: string;
  age: number;
}

//  "name" | "age"
type PersonKeys = keyof Person;

// 泛型参数约束
function getObjProperty<O, K extends keyof O>(obj: O, key: K) {
  return obj[key];
}

const info = {
  name: '张三',
  age: 18,
  sex: '男',
};
getObjProperty(info, 'name');
```

![keyof 使用](https://jsonq.top/cdn-static/2025/02/25/1740465694153-959mrc0i.jpeg)

## 映射类型

- 有的时候，一个类型需要基于另外一个类型，但是你又不想拷贝一份，这个时候可以考虑使用映射类型。
  - 大部分内置的工具都是通过映射类型来实现的
  - 大多数类型体操的题目也是通过映射类型完成的
- 映射类型建立在索引签名的语法上
  - 映射类型，就是使用了 PropertyKeys 联合类型的泛型
  - 其中 PropertyKeys 多是通过 `keyof` 创建，然后**循环遍历键名**创建一个类型

```ts
// 映射类型不能使用 interface 定义
interface Person {
  name: string;
  age: number;
  sex: string;
}

// 映射类型
type MapPerson<T> = {
  [k in keyof T]: T[k];
};

// 相当于把 Person 的类型 copy 一份赋值给 新类型
type NewPerson = MapPerson<Person>;
```

**映射修饰符**

- 类型映射时，可以使用 `readonly`、`?` 来设置属性的修饰条件
- 可以通过前缀 `-` 或者 `+` 删除或者添加这些修饰符，如果没有写前缀，相当于使用了 `+` 前缀

```ts
// 映射类型
type MapPerson<T> = {
  // 在映射属性类型时，可以选择给属性设置条件，比如：readonly、?，来约束该属性时只读或者可选
  // - 表示删除的意思。映射时删除可选(-?)/只读(- readonly)属性，即映射为必填/可修改
  +readonly [k in keyof T]-?: T[k];
};
```

## 条件类型(extends 判断)

### 条件类型-判断

条件类型的判断只有 `extends`，类似 js 的三目运算

**简单使用**

```ts
type IDType = number | string;

// 判断 number 是否是 extends IDType
// const res = 3 > 2 ? true : false;
type ResType = boolean extends IDType ? true : false; // type ResType = false

// 应用场景

// 函数重载：正常需要限制传入的参数必须都为 string 或都为 number
/* function sum(a: string, b: string): string;
function sum(a: number, b: number): number;
function sum(a: any, b: any) {
  return a + b;
} */

// 错误做法：类型扩大化，可以传入 a=1, b="aaa"  不符合需求
// function sum(a: string | number, b: string | number): string | number;

/**
 * T extends string | number：限制传入的参数为 string | number
 * a: T, b: T ：限制传入的两个参数类型一样
 * (...): T extends number ? number : string：如果不做条件类型判断 ，返回的参数是字面量而非类型
 */
function sum<T extends string | number>(a: T, b: T): T extends number ? number : string;
function sum(a: any, b: any) {
  return a + b;
}

// 类型推导出的 res 是 number 类型，如果没有类型判断 res 为 20|30 字面量
const res = sum(20, 30);
```

### 函数返回值类型推断(ReturnType)

字面意思，推断出函数类型的返回值

```ts
type Fn1Type = (a: number, b: number) => number;
function foo() {
  return 'abc';
}

// type Fn1ReturnType = number
type Fn1ReturnType = ReturnType<Fn1Type>;

// type fooReturnType = string
type fooReturnType = ReturnType<typeof foo>;
```

### 条件类型-推断(infer)

`infer` 关键字 就是用来推断某种类型的

```ts
type Fn1Type = (a: number, b: number) => number;
function foo() {
  return 'abc';
}

// 使用 infer 推断返回类型并将其返回
type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R
  ? R
  : never;

// 使用 infer 推断参数并返回参数类型
type MyParamType<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

type Fn1ReturnType = MyReturnType<Fn1Type>; // type Fn1ReturnType = number
type Fn1ParamType = MyParamType<Fn1Type>; // type Fn1ParamType = [a: number, b: number]

type fooReturnType = MyReturnType<typeof foo>; // type fooReturnType = string
type fooParamsType = MyParamType<typeof foo>; // []
```

### 条件类型-联合类型分发

在泛型中使用条件类型的时候，如果传入一个联合类型，会变成 **分发类型**

```ts
// type toArray<T> = T[]
type toArrayType<T> = T extends any ? T[] : never;

type newType1 = toArrayType<number>; // type newType1 = number[]

// 如果不做条件类型判断进行分发，得到的是 (string | number)[]
type newType2 = toArrayType<number | string>; // type newType2 = number[] | string[]
```

## 常用内置工具

### Partial

`Partial<T>` 可以将一个类型的所有属性转变为**可选属性**

```ts
type Person = {
  name: string;
  age: number;
  sex?: string;
};

// 类型体操实现 Partial 使用映射类型实现
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type PartialPerson = Partial<Person>;
```

### Required

`Required<T>` 所有属性全都设置为必填的类型，跟 `Partial` 相反

```ts
type MyRequired<T> = {
  // (-?)删除可选操作符，即都变为必选
  [K in keyof T]-?: T[K];
};

type RequiredPerson = Required<Person>;
```

### Readonly

`Readonly<T>` 的所有属性全都设置为**只读的类型**，只读类型不可赋值不可更改

```ts
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type ReadonlyPerson = Readonly<Person>;
```

### Record

`Record<Keys,T>` 用于构造一个对象类型，它所有的 key(键)都是 Keys 类型，它所有的 value(值)都是 T 类型。  
具体功能如图所示：

![Record 基本用法](https://jsonq.top/cdn-static/2025/02/25/1740465694247-s561dxqq.png)

```ts
type Person = {
  name: string;
  age: number;
  sex?: string;
};

type CityKeys = '北京' | '上海' | '广州' | '深圳';

// keyof 的使用
type Keys = keyof Person; // "name" | "age" | "sex"
type Res = keyof any; // string | number | symbol

// 需要确定 Keys 一定是可以作为 key 的联合类型：string | number | symbol，像 boolean就无法作为 key
type MyRecord<Keys extends keyof any, T> = {
  [K in Keys]: T;
};

type RecordPerson = Record<CityKeys, Person>;
```

### Pick

`Pick<T,Keys>` 是从原类型 T 中挑选出部分 T 拥有的部分属性 Keys，生成一个新的类型

![Pick 使用](https://jsonq.top/cdn-static/2025/02/25/1740465694336-ofmhxevh.png)

```ts
type Person = {
  name: string;
  age: number;
  sex?: string;
};

// 限制 Keys 必须是 T 身上的属性
type MyPick<T, Keys extends keyof T> = {
  [K in Keys]: T[K]; // 将这些 Keys 逐一赋上对应的类型
};

type PickPerson = Pick<Person, 'name' | 'age'>;
```

### Omit

`Omit<T,keys>` 和 `Pick<T,keys>` 刚好相反，是排除掉 Keys 在 T 类型中的属性，生成新的类型

```ts
type Person = {
  name: string;
  age: number;
  sex?: string;
};

type MyOmit<T, Keys extends keyof T> = {
  // K extends Keys：判断 K 是否 Keys 中，如果是，则为排除项，不使用
  // 即 K in Keys as never  /  K in Keys as K
  [K in Keys as K extends Keys ? never : K]: T[K];
};

type OmitPerson = Omit<Person, 'name'>;
```

### Exclude

`Exclude<T, U>` 从**联合类型**中排除掉 U 属性，此处的 U 不一定是 T 中的某个类型

```ts
type CityType = '北京' | '上海' | '广州' | '深圳';

type MyExclude<T, U> = T extends U ? never : U;

// type ExcludePerson = "广州" | "深圳"
type ExcludePerson = Exclude<CityType, '北京' | '上海'>;
// type ExcludePerson = '北京' | '上海' | '广州' | '深圳';
type ExcludePerson = Exclude<CityType, 'aaaa'>;
```

此时可以使用 `Exclude` 尝试改造 `Omit`

```ts
type MyOmit<T, Keys extends keyof T> = Pick<T, Exclude<keyof T, Keys>>;
```

### Extract

`Extract<T, U>` 和 `Exclude` 刚好相反，提取**联合类型** T 中的某些属性 U

```ts
type MyExclude<T, U> = T extends U ? U : never;
```

### NonNullable

`NonNullable<T>`从**联合类型** T 中排除了所有的 null、undefined 的类型

```ts
type CityType = '北京' | '上海' | '广州' | '深圳' | undefined | null;

type MyNonNullable<T> = T extends null | undefined ? never : T;

// type CityType = "北京" | "上海" | "广州" | "深圳" |
type NonNullablePerson = NonNullable<CityType>;
```

### ReturnType

`ReturnType<T>` 推断出 T 函数的返回值的类型。

```ts
function sum(a: number, b: number) {
  return a + b;
}

function info(a: number, b: string) {
  return a + b;
}

type SumReturnType = ReturnType<typeof sum>; // number
type InfoReturnType = ReturnType<typeof info>; // string

// 具体实现
/**
 * 第一个 extends (...args) => 是为了限制传入的 T 类型
 * 第二个 extends (...args) => 是做判断 ，使用 infer 推断类型并返回
 */
type MyReturnType<T extends (...args) => any> = T extends (...args) => infer R ? R : never;
```
