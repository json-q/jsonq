---
title: 快速过 Java
pubDate: 2026-06-19
description: Java 速学
draft: true
tags:
  - Java
  - 开发
---

## Java 基础

### 数据类型

| 类型           | 字节  | 默认值   | 示例写法               |
| -------------- | ----- | -------- | ---------------------- |
| byte           | 1     | 0        | byte b = 100;          |
| short          | 2     | 0        | short s = 10000;       |
| int            | 4     | 0        | int i = 100000;        |
| long           | 8     | 0L       | long l = 10000000000L; |
| float          | 4     | 0.0f     | float f = 3.14f;       |
| double         | 8     | 0.0d     | double d = 3.1415926;  |
| char           | 2     | '\u0000' | char c = 'A';          |
| boolean 不确定 | false | boolean  | flag = true;           |

类型转换：小类型转大类型是自动的（隐式转换），大类型转小类型需要强制转换，可能会丢失数据。

byte < short < int < long < float < double

```java
int a = 100;
long b = a;        // 小转大，自动转换，没问题
double c = a;      // 小转大，自动转换，没问题

long x = 100L;
int y = (int) x;   // 大转小，需要强制转换，如果x超出int范围就会丢失
```

引用数据类型的强制转换的前提是，两个类型之间存在继承关系。

```java
class Person {}
class Student extends Person {}

class Test {
  public static void main(String[] args) {
    Student s = new Student();
    Student p = new Student();
    // 自动类型转换
    person = student;
    // 强制类型转换
    student = (Student) person;
  }
}
```

实现类和接口也可以进行类型转化，因为接口和实现类本质上也是父类和子类的继承关系。

```java
// 一个接口（相当于“父类型”）
interface Animal {
    void makeSound();
}

// 实现类（相当于“子类型”）
class Dog implements Animal {
    @Override
    public void makeSound() {
        System.out.println("汪汪");
    }

    // 子类型特有的方法
    public void wagTail() {
        System.out.println("摇尾巴");
    }
}

// 3. 测试类型转换
public class Main {
    public static void main(String[] args) {
        // 向上转型：实现类对象 -> 接口引用（自动转换）
        Animal animal = new Dog();
        animal.makeSound();          // 输出：汪汪
        // animal.wagTail();         // 错误！接口引用无法调用子类特有方法

        // 向下转型：接口引用 -> 实现类引用（强制转换）
        if (animal instanceof Dog) { // 一般需要先判断
            Dog dog = (Dog) animal;  // 强制转换
            dog.wagTail();           // 输出：摇尾巴
            dog.makeSound();         // 输出：汪汪
        }
    }
}
```
