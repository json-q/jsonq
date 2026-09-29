---
title: 学习 Rust
pubDatetime: 2026-09-25
modDatetime: 2026-09-29
description: 简单上手学习一下 Rust
tags:
  - Rust
  - Rust 学习
---

> 暂时搁置 Rust 的学习，先继续搞 Java 了（忙不过来了，淦）。

起因是玩的一个游戏可以通过解析本地缓存数据来获取当前账号下的绝大部分信息，让部分信息更直观的展示。使用的 tauri，对应的解析层逆向是 Rust，用 AI 开发的基础版虽然能用，也能让 AI 继续往上堆功能，但是更希望自己能掌握这门语言的用法。（早都想接触一下 Rust 了，毕竟是编程界的原神）。

Java 是工作，Rust 是兴趣。

## Table of Contents

## 基础入门

学习的前提当然是安装 Rust 相关环境，[安装 Rust](https://rust-lang.org/zh-CN/tools/install)，官网推荐使用 rustup 来运行和管理 Rust 环境，很简单，不赘述。

官方推荐使用 Vscode 进行开发，安装 `rust-analyzer` 插件，获取自动补全、lint 等功能。

### 第一个 Rust Demo

```rust
fn main(){
    println!("Hello World!");

    let a: i32 = 5;
    println!("a is {}", a); // 这种打印写法和 Java 的 Slf4j 差不多
}
```

执行 `rustc main.rs` 编译成可执行文件。然后运行 `./main` 即可。

> `rust-analyzer` 无法识别到单个 rs 文件，因为默认 `rust-analyzer` 只会识别以 cargo 创建的 crate 项目。已有项目可执行 `cargo init .`，新项目可执行 `cargo new [project-name]`

Cargo 跟 Node 的 npm、Java 的 Maven 差不多

### 数据类型和变量

所有数据类型可查看 [Data Types](https://doc.rust-lang.org/book/ch03-02-data-types.html)

#### Unit Type 单元类型

非要列举的话，类似于 Java 中的 void。在 Java 中，一个函数不需要返回值的时候，可以返回 `void`，rust 则返回`()`。但语法层面上，void 仅仅只是一个类型，任何值都无法赋给 void，单 unit type `()` 既是一个类型，同时又是该类型的值。

unit type `()` 只能赋值给 `()`，其他任何类型都无法赋给它。

```rust
fn test_unit_type() {
    let a: () = ();
    // let b:() = 5; // mismatched types expected `()`, found integer
    println!("a is {:?}", a); // a is ()
}
```

值得注意的是，unit type 类型的 print 不能直接使用 `"a is {}"`，必须使用 `{:?}` 或 `{#?}`。

#### Integer Type 整数类型

不同于现有大部分语言，Rust 将整数类型分为了有符号整数(`i`)和无符号整数(`u`)。整数的二进制都是由 0 和 1 组成的，如果有符号，符号本身需要占一位，因此有符号整数的范围比无符号整数的范围要小。

有符号整数(`i`)可表示负数和正数，无符号整数(`u`)只能表示正数。

```rust
fn test_integer_type() {
    let a: i8 = -127; // √
    let b: u8 = 255; // √
    println!("a is {}, b is {}", a, b);

    // 超出了 i8 的范围
    // iteral out of range for `u8` the literal `256` does not fit into the type `u8` whose range is `0..=255`
    let d: u8 = 256; // ×

    // 无符号整数不能表示负数
    // cannot apply unary operator `-` to type `u8` unsigned values cannot be negated
    let e: u8 = -1; // ×
}
```

#### Float Type 浮点数类型

浮点数只有 `f32` 和 `f64` 两种，分别对应 32 位和 64 位。在数字运算中，运算的数据必须是同一种数据类型，否则报错。

当然可以通过数据转换 `as` 来解决。这种用法和 ts 的 as 非常像，只不过 ts 是类型转换，rust 是数据转换。

```rust
fn test_float_type() {
    let a: f32 = 255.0;

    // cannot subtract `{integer}` from `f32` the trait `Sub<{integer}>` is not implemented for `f32`
    let b: u8 = a - 5; // ×
    let b: u8 = a as u8 - 5; // √
    println!("b is {}", b); // b is 250
}
```

注意：如果 `let a: f32 = 256.0;`，在类型转换时，由于 `u8` 的范围是 0-255，所以会强制变成 255，而不是原来的 266

#### Boolean Type 布尔类型

boolean 类型只有两个值，true 和 false，可以显示设置类型，也可以让 rust 自动推导类型，`rust-analyzer` 会自动提示类型。

```rust
fn test_boolean_type() {
    let a: bool = true; // 显式声明类型
    let b = false; // 自动推导类型，但是 rust-analyzer 会自动提示 bool
}
```

值得注意的是以下例子，Rust 默认声明的变量是 immutable，也就是不可变变量，类似 js 的 const，但是 const 可以给 对象、数组等值的地址赋值（比如 `obj.a = 1` `arr[0] = 1`）。

在 Rust 中，所有变量想要进行更改，都必须添加 `mut` 修饰符。

```rust
fn test_immutable_variable() {
    let a: bool = true;
    a = false; // cannot assign twice to immutable variable `a`
    println!("a is {}", a);

    let mut b: u8 = 8;
    b = 5; // √
    println!("b is {}", b);
}
```

#### Character Type 字符类型

char 类型就是 Unicode 字符，且 char 类型必须使用`''`单引号，双引号会被认为字符串，emoji 也是 char 类型。

```rust
fn test_character_type() {
    let a: char = 'A';
    println!("a is {}", a);

    let heart_eyed_cat = '😻';
    println!("heart_eyed_cat is {}", heart_eyed_cat);
}
```

`&str` 用来表示字符串，字符串是字符的集合，字符串是动态分配的。声明方式有两种，一种使用 `&str`，一种使用 `String`。

```rust
fn test_string_type() {
    let s1: &str = "hello world";
    println!("s1 is {}", s1);

    let s2: String = String::from("hello");
    let s3: String = "world".to_string();
    println!("s2 is {}, s3 is {}", s2, s3);
}
```

#### Tuple Type 元组类型

TS 中也有 Tuple 的概念 `const myTuple: [number, boolean, string] = [5, true, 'Hello'];`

Rust 的元组写法是 `(类型, 类型, ...)`，跟 ts 的差不多。

```rust
fn test_tuple_type() {
    let a: (i32, bool, char) = (5, true, 'A');
    println!("a is {:?}", a); // a is (5, true, 'A')
    println!("a.0 is {}, a.1 is {}, a.2 is {}", a.0, a.1, a.2); // a.0 is 5, a.1 is true, a.2 is A
}

fn test_tuple_type_destructuring() {
    let (a, b, c) = (5, true, 'A');
    println!("a is {}, b is {}, c is {}", a, b, c);
}
```

#### Array Type 数组类型

数组是静态分配的，长度不可变，且数据类型必须一致。

```rust
fn test_array_type() {
    let a: [i32; 3] = [1, 2, 3];
    println!("a is {:?}", a); // a is [1, 2, 3]
    println!("a[0] is {}", a[0]); // a[0] is 1
}

fn test_array_type_destructuring() {
    let [a, b, c] = [1, 2, 3];
    println!("a is {}, b is {}, c is {}", a, b, c);
}
```

#### Slice Type 切片类型

Slice 并不真正拥有指向的数据，只是从指向的类型借用数据，因此不会修改原始数据。正常跟 js 的 slice 效果一样。

但是 Rust 的 Slice 更强，可以指定是否包含上限索引，比如 `&a[1..3]` 这里取到的是第 1、2 个元素（索引从 0 开始） 两个元素。而 `&a[1..=3]` 取到的是第 1、2、3 个元素一共三个元素。

```rust
    let a: [i8; 5] = [1, 2, 3, 4, 5];
    let new_a: &[i8] = &a[1..3];
    println!("a is {:?}, new_a is {:?}", a, new_a); // a is [1, 2, 3, 4, 5], new_a is [2, 3]

    let new_a_1: &[i8] = &a[1..=3];
    print!("new_a_1 is {:?}", new_a_1); // new_a_1 is [2, 3, 4]
```

### 函数和模块

#### 函数

最基础的函数写法

```rust
// #[allow(dead_code)] 让 rust 在编译时忽略未使用的警告
fn get_full_name(first: &str, last: &str) -> String {
    // 如果 format 中指定了索引，则按照传入的索引顺序进行填充
    // rg: format!("{1} {0}", first, last) // last first
    let full_name = format!("{} {}", first, last);
    return full_name;
}

fn main() {
    let full_name: String = get_full_name("Jackie", "Chan");
    println!("full_name is {}", full_name);
}
```

顺带一提，如果一个函数从未被使用，而又不想让 rust 编译器警告，则可以使用 `#[allow(dead_code)]` 这种 outer attribute 来明确告诉 rust 忽略这个函数。

#### 模块

rustc 仅仅接收一个参数，也就是说 rust compiler 仅仅能接收一个文件，这意味着无法将多个 rs 文件作为源码一起传递给 rust 进行编译。而所有内容都写在单文件无疑是非常坏的决策，因此可以通过模块，将单文件中的功能拆分为各个模块然后引入。

**注意：**模块文件内的函数，默认都是私有的（private），外部无法使用，如果想要外部使用，则需标记为 `pub`，调用则通过 `模块名::函数名` 的方式调用模块内部的函数。

如果 helper.rs 文件和 main.rs 文件同级

```rust
// helper.rs
pub fn get_full_name(first: &str, last: &str) -> String {
    let full_name = format!("{1} {0}", first, last);
    return full_name;
}

// main.rs
mod helper; // pub mod helper; 的 pub 可省略

fn main() {
    let full_name: String = helper::get_full_name("Jackie", "Chan");
    println!("full_name is {}", full_name);
}
```

如果 helper.rs 文件在 utils 目录下

```rust
#[path = "utils/helper.rs"] // 告诉 rustc helper.rs 文件在 utils 目录下
mod helper;

fn main() {
    // ...
}
```

#### 模块的嵌套子模块

模块内部也可以定义子模块，比如 `pub mod utils1{...}` `pub mod utils2{...}` 等等，每个子模块内都可以有很多的方法，在调用侧则 `文件名::子模块名::方法名` 这种方式调用即可。有点类似于 ts 的命名空间和 Java 的 class 嵌套

```rust
// helper.rs
pub mod utils {
    pub fn get_full_name(first: &str, last: &str) -> String {
        let full_name = format!("{1} {0}", first, last);
        return full_name;
    }
}
pub mod utils2 {
  // ...
}
pub mod utils3 {
  // ...
}

// main.rs
fn main() {
    let full_name: String = helper::utils::get_full_name("Jackie", "Chan");
}
```

### 条件表达式和控制流语句

结合官方文档 [Control Flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html)

if else 语句，Rust 中的 if 是不加括号的

```rust
fn test_if() {
    println!("Please enter your score: ");
    let input_value: &mut String = &mut String::from("");
    std::io::stdin().read_line(input_value).unwrap();

    // 将接收的字符串转换成数字
    // trim() 如果不加这个是无法转换成 u8 的，因为输入默认包含了一个 \n（mac） 或 \r\n（windows）
    let score: u8 = input_value.trim().parse::<u8>().unwrap();
    if score >= 60 && score < 80 {
        println!("Score is passed");
    } else if score >= 80 {
        println!("Score is excellent");
    } else {
        println!("Score is failed");
    }
}

fn test_if_line() {
    let score: u8 = 60;
    // 这种写法可以让 if else 语句更简洁，但是复杂的还是推荐用正常的写法
    let is_passed: bool = if score >= 60 { true } else { false };
}
```

while/loop 循环，很简单。loop 只有代码块，不能添加条件，因此只能在 loop 代码块中使用 break 退出循环。

```rust
fn test_while() {
    let total: u8 = 6;
    let mut count: u8 = 0;

    while count < total {
        println!("count is: {}", count);
        count += 1;
        // break; 中止循环
    }
}

fn test_loop() {
    let mut count: u8 = 0;
    loop {
        println!("count is: {}", count);
        if count > 5 {
            break;
        }
        count += 1;
    }
}
```

for 循环，iter() 迭代器，map() 映射，sum() 求和，有点像 Java 的 Lambda 表达式写法

```rust
fn test_for() {
    let numbers: [i32; 5] = [64, 55, 98, 73, 32];
    let mut total: usize = 0;

    for value in numbers {
        total += value as usize;
    }
    println!("total is: {}", total);
}

fn test_for_iter() {
    let numbers: [i32; 5] = [64, 55, 98, 73, 32];
    let total: usize = numbers.iter().map(|&v| v as usize).sum();
    println!("total is: {}", total);
}
```

#### match

见 [Enums and Pattern Matching](https://doc.rust-lang.org/book/ch06-00-enums.html)

match 语句用法比较特殊，硬要说用法的话就是 switch。在 Rust 中，Rust 会推荐穷举所有可能出现的情况（没有写 `_` 兜底的情况），匹配不到的用 `_` 来表示，如果只有一行代码，若需要简洁性，`{}` 可省略

match 在匹配到条件后，就不会继续往下执行，当匹配到第一个满足条件的分支后就会停止执行。相当于自动写了 `break;`

```rust
fn test_match_int(age: u8) {
    match age {
        1..=15 if age > 10 => {
            println!("Your age is between 11 and 15")
        }
        16 => {
            println!("Your age is 16")
        }
        18 | 19 => {
            println!("Your age is 18 or 19")
        }
        20..=30 => {
            println!("Your age is between 20 and 30");
        }
        31.. => {
            println!("Your age is greater than or equal to 31");
        }
        _ => {
            println!("not matching");
        }
    }
}
```

像以下代码，如果缩写的直接是一个值，那此时 match 会将这个匹配当作一个返回值，就需要在 fn 函数上声明返回类型。如果不需要返回类型，则在 match 后面加 `;`，对，仅仅添加 `;` 就可以了

```rust
// 注意，编译器不允许返回类型不同的匹配值，必须都是同一个类型
fn test_match_string(name: &str) {
    match name {
        "Rust" => "This is Rust",
        "C++" => "This is C++",
        _ => "I don't know",
    }; // 不想返回类型添加 ;
}
```

match 匹配数组时，可以匹配数组的某一段是否符合

```rust
fn test_match_array(arr: [u32; 5]) {
    match arr[0..=1] {
        [218, 20] => {
            println!("only array[0] and array[1] is 218 and 20");
        }
        [300, 540, ..] => {
            println!("array[0] array[1]  is 300 and 540");
        }
        _ => {
            println!("match failed");
        }
    }
}
```

### 闭包（匿名函数）

见 [Closure](https://doc.rust-lang.org/book/ch13-01-closures.html)

最简单的闭包，`let some_fn = || {代码块}`，把 `||` 当作函数的 `()` 来理解的话会好很多

```rust
fn test_closure() {
    // js 写法映射 const print_text = ()=> console.log("test_closure")
    // 以 js 写法来说其实就是把 `()=>` 换成 `||`
    let print_text1 = || println!("test_closure");

    // 以上代码是缩写，单行省略了 {}，等价于 👇
    let print_text2 = || {
        println!("test_closure");
    };

    print_text1();
}
```

带参数的闭包，一个正常的 Rust 函数，变量都是需要声明类型的。而闭包可以忽略类型，由编译器自动推断，同样的，简单的返回类型也可以自动推断。

但是，**当没有声明参数类型的，闭包函数首次被调用后，编译器就推断并确定了类型，就无法再改变类型了**，后续再调用，参数类型也不会改变了

```rust
fn test_closure_with_param() {
    // |text: &str| 就等价于 (text: &str)，这么来看，第一眼确实抽象，但是理解了还好
    let print_text = |text: &str| println!("params `text` is {}", text);

    print_text("Hello, Rust!");
}

fn test_closure_with_param_un_type() {
  // 这里 text 没声明类型，由编译器自动推断
    let print_text = |text| println!("params `text` is {}", text);

    print_text(123); // 编译器推断出为 i32
    // 传入 &str 就会报错
    print_text("Hello, Rust!"); // mismatched types expected integer, found `&str`
}
```
