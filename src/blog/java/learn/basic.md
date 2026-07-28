---
title: Java 基础学习
pubDate: 2026-07-21
description: 深入学习一下 Java，以便后续的项目开发
draft: true
tags:
  - Java
---

非常基础的东西略过，因为本来就会且没意义，此次可以当作详细学习巩固基础，以便应对后端项目的深入开发

# Java 基础

## 面向对象

### 基础

#### this 关键字

跟前端的 this 差不多，就近原则。

- 当局部变量和成员变量重名时，可以通过 this 访问成员变量
- 访问成员变量，当不涉及重名问题时， this 可以省略
- 调用成员方法，this 可以直接省略

```java
public class Test {
  private String name;

  public void setName(String name) {
    System.out.println(this.name)
    this.name = name;
  }

  public void ignoreThis() {
    // 省略 this 也可以
    System.out.println(name);
    setName("张三");
  }
}
```

- this 代表当前类的地址引用。

```java
public class Person {
 private String name;

 public void printThis() {
   System.out.println(this);
 }
}

public class Test {
 public static void main(String[] args) {
   Person person = new Person();
   System.out.println(person); // Person@1b6d3586
   person.printThis(); // Person@1b6d3586
 }
}
```
