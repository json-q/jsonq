---
title: Java 基础学习
pubDate: 2026-07-21
description: 深入学习一下 Java，以便后续的项目开发
draft: true
tags:
  - Java
---

非常基础的东西略过，因为本来就会且没意义，此次可以当作详细学习巩固基础，以便应对后端项目的深入开发。记一点比较重要的内容，感觉基本用不上的就不记录了，

> 一个 Java 文件中只能有一个 public 类，且被修饰的类名必须与文件名一致。

## Table of contents

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

#### 构造方法

不写的话 Java 会默认生成一个无参构造方法，可以 IDEA 右键 Generate 快速生成，后边有 lombok 就不这么麻烦了。

- 无返回类型，无 void，无 return 值
- 会在创建对象时调用。

```java
public class Person {
  String name;
  int age;

  // 无参和有参其实就是重载
  public Person() {
    System.out.println("无参构造方法");
  }

  public Person(String name, int age) {
      this.name = name;
      this.age = age;
      System.out.println("有参构造方法");
  }
}

public class Test {
  public static void main(String[] args) {
    Person person = new Person();
    System.out.println(person.name); // null 无参构造方法
    Person person1 = new Person("张三", 18)
    System.out.println(person1.name); // 张三 有参构造方法
  }
}
```

#### 权限修饰符

| 修饰符    | 当前类中 | 当前包中 | 不同包的子类 | 不同包的非子类 |
| --------- | -------- | -------- | ------------ | -------------- |
| private   | √        |          |              |                |
| (default) | √        | √        |              |                |
| protected | √        | √        | √            |                |
| public    | √        | √        | √            | √              |

protected 开发中基本用不到

```java
// com.example.a;
public class Base {
    protected int value = 42;   // protected 成员
}

// com.example.a; 同包非子类
public class SamePackage {
    public void access(Base b) {
        System.out.println(b.value);  // ✅ 可以访问（同包）
    }
}
//  com.example.b; 不同包子类
public class Subclass extends Base {
    public void access() {
        System.out.println(value);     // ✅ 可以访问（子类继承）
    }
}
// com.example.b; 不同包非子类
public class NonSubclass {
    public void access(Base b) {
        // System.out.println(b.value); // ❌ 编译错误
    }
}
```

#### JavaBean

开发中的数据实体都用这个

- JavaBean 类的属性必须私有，并且提供 getter 和 setter 方法。
- JavaBean 类必须提供无参和有参构造方法。

#### static 关键字

- static 修饰的成员变量，被该类下的所有对象共享
- static 修饰的才可以通过 `Student.name`（直接类名访问无需 new） 访问静态成员变量并赋值（推荐）
- 随着类加载而创建，优于对象存在。`Student.schoolName="清华大学"` 可以在 `new Student()` 之前赋值。

```java
public class Student {
  public static String schoolName;
  public int age;
}

public class Test {
  public static void main(String[] args) {
    Student.schoolName = "清华大学";

    Student student = new Student();
    System.out.println(student.schoolName); // 清华大学

    Student student1 = new Student();
    System.out.println(student1.schoolName); // 清华大学
  }
}
```

注意事项：

- static 修饰的方法只能**直接访问** static 修饰的成员变量
- static 静态方法内没有 this 关键字

### 高级

#### 继承 extends

继承是面向对象三大特征之一，封装、继承、多态。

跟前端的 TS 差不多，子类 extends 父类，子类会继承父类的属性和方法（除了私有属性和方法），在实际场景中，需要继承的父类一般都是公共属性的基类。

- 当子类和父类存在同名成员变量时，直接访问到的是子类的成员变量（就近原则），如果想访问父类的，可以通过 `super.变量名`

```java
public class Person {
  int sex="男"
}

public class Student extends Person {
  int sex="女";

  public void printSex() {
    int sex="未知";
    System.out.println(sex); // 未知
    System.out.println(this.sex); // 女
    System.out.println(super.sex); // 男
  }
}
```

- 当子类和父类存在同名方法（**方法名入参返回值都一致**）时，子类可以用 `@Override` 重写父类的方法，重写时，也必须保持方法名入参返回值都一致，不然报错。

```java
public class Father {
  public void love() {
    System.out.println("三大件：手表、自行车、缝纫机");
  }
}

public class Son extends Father {
  @Override
  public void love() {
    System.out.println("三大件：房、车、钱");
  }

  // 方法名相同，但是入参/返回值不一致，就不属于重写，属于重载
  public void love(String gender){
    System.out.println("三大件：房、车、钱");
  }
}
```

- 继承的一些访问特性

1. 子类无法继承父类的构造方法
2. 子类在初始化时，系统会自动调用父类的构造方法，父类构造方法早于子类构造方法执行，因为子类很有可能通过 super 访问父类的变量或方法
3. 基于第 2 点，子类所有的构造方法，首行默认添加 super() 从而完成调用父类的构造方法

```java
public class Father {
  public Father() {
    System.out.println("父类无参构造方法");
  }
}

public class Son extends Father {
  public Son() {
    //  super() // 默认添加
    System.out.println("子类无参构造方法");
  }
}

new Son(); // 打印顺序：父类无参构造方法 -> 子类无参构造方法
```

#### Object/Objects

1. `Object`

跟 js 一样，万物皆对象，Object 是所有类的父类，所有的类都继承了 Object 类。

- toString(): 返回对象的字符串或者地址

通过 `System.out.println()` 输出时，会自动调用 `toString()` 方法，一般 JavaBean 类都会重写 `toString()` 方法，返回对象的属性值。

- equals(): 判断两个对象是否相等

`==` 只适合比较基本类型值，判断两个对象是否相等，使用 `a.equals(b)`，开发中，通常推荐重写 `equals()` 方法来自定义比较

2. `Objects`

- `Objects.equals(a, b)`: 判断两个对象是否相等，比 `Object.equals()` 更加安全，因为底层会自动处理空指针异常的情况
- `Objects.isNull(a)`: 判断对象是否为 null（源码就是 `== null`）

#### final 关键字

- final 关键字：修饰的类不能被继承，修饰的方法不能被重写，修饰的成员变量不能被修改（基本类型值不可改，引用类型引用地址不可改，类似 `const`）

final 修饰的成员变量，要么直接写值，要么在构造方法中赋值。final 修饰的变量时常量，命名规范上应该是 全大写单词之间 `_` 连接。

#### 抽象类 abstract

父类抽象类中只定义共性的行为，不定义具体的实现，abstract 修饰的方法所在的类必须是抽象类，子类要么**也是抽象类**，要么**强制实现抽象方法**。

```java
// 比如每个人都有工作，但是每个人的工作并不一定一样
public abstract class Person {
    public abstract void work();
}

class PersonA extends Person {
    @Override
    public void work() {
        System.out.println("厨师");
    }
}

class PersonB extends Person {
    @Override
    public void work() {
        System.out.println("码农");
    }
}
```

抽象类注意事项：

- 抽象类不能实例化（不能 new，但是依然存在构造方法），只能被继承
- 抽象类中可以有抽象方法，也可以有普通方法

abstract 关键字冲突：

- final：被 `abstract` 修饰的方法，强制要求子类重写，被 `final` 修饰的类不能被重写
- private：被 `abstract` 修饰的方法，强制要求子类重写，被 `private` 修饰的方法不能被重写
- static：被 `static` 修饰的方法可以类名调用，类名调用抽象方法没有意义

#### 接口 interface

接口就是对行为的抽象（abstract），如果一个 class 类全都是对规则的定义（抽象类），那么这个类就可以改写成接口。

接口和抽象类一样，子类在实现（implements）接口时，必须实现接口中的所有抽象方法，要不然子类就也成为抽象类。

```java
public abstract class Person {
  public abstract void work();
  public abstract void eat();
}

public interface Person {
  public abstract void work();
  public abstract void eat();
}
```

接口的特点：

- 接口不能实例化，因为是抽象类
- 接口内的成员变量会自动添加 `public static final` 修饰符
- 接口内的方法只能是抽象方法（JDK8 可以通过 `default` 修饰符，非强制子类实现，JDK9 可以使用 `private` 修饰，这种不会被子类实现），因为默认会添加 `public abstract` 修饰符
- 接口没有构造方法
- 类可以一次性实现多个接口，但是只能继承一个类
- 接口中如果有 static 修饰的静态方法，只能通过接口名调用

```java
public interface Person {
  String NAME = "张三";

  private void fn() {} // JDK9 开始支持，不会被子类实现

  void work(); // 等价于 public abstract void work();

  // public void eat(){} // 报错
  // default void eat() {} // JDK8 显式添加 default 修饰符可以标记成**可选实现的抽象类**，子类可以不实现，也可以实现
}

// Person person = new Person(); // 报错 因为抽象
// Person.NAME = "李四"; // 报错 因为 final 修饰
System.out.println(Person.NAME);
```

#### 多态

有以下特点的才是多态：

- 有继承/实现关系
- 有方法重写
- 父类引用指向子类对象

虽然在转换成父类时无法使用子类的特有方法，但是可以用 `instanceof` 来判断属于哪个子类，进而访问子类的特有方法。

```java
public class Person {
  public void eat() {
    System.out.println("吃吃吃");
  }
}
// 有继承 有方法重写
public class Student extends Person {
  @Override
  public void eat() {
    System.out.println("不仅吃还喝");
  }
}

Student student = new Student(); // 子类引用指向子类对象
Person person = new Student(); // 父类引用指向子类对象
```

多态的应用场景

```java
abstract class Animal {
  void eat();
}
class Dog extends Animal {
  @Override
  public void eat() {
    System.out.println("狗吃肉");
  }
}
class Cat extends Animal {
  @Override
  public void eat() {
    System.out.println("猫吃鱼");
  }
}

public void useAnimal(Animal animal){
  animal.eat();
}

// Usage
useAnimal(new Dog());
useAnimal(new Cat());
```

#### 内部类
