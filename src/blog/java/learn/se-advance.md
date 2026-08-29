---
title: 二、Java SE 高级
pubDatetime: 2026-08-29
description: File IO 线程等相关知识
tags:
  - Java
  - Java 学习
---

所有笔记内容基于网络上的黑马视频课程自行整理，如有侵权，请联系删除...

## Table of contents

## File

1. File 创建文件，如果路径是相对路径，那就会在当前运行项目的根目录下查找或创建

- File(String pathname)
- File(String parent, String child)
- File(File parent, String child)

```java
File file = new File("E:\\A.txt"); // 文件路径和文件夹路径都支持
File file1 = new File("E:\\", "A.txt");
File file2 = new File(new File("E\\"), "A.txt");

System.out.println(file.exists()); // 是否存在

// 创建文件，相对路径，在当前项目根目录创建
File file3 = new File("A.txt");
try {
    boolean newFile = file3.createNewFile();
    System.out.println(newFile); // true
    System.out.println(file3.getAbsoluteFile()); // F:\myself\java-learn\java-01\java-01\A.txt
} catch (IOException e) {
    throw new RuntimeException(e);
}
```

2. File 常用 API

- `isDirectory()` 判断是否是目录（文件夹）
- `isFile()` 判断是否是文件
- `exists()` 判断文件是否存在
- `length()` 获取文件大小
- `getName()` 获取文件名（带后缀）
- `getAbsoluteFile()` 获取绝对路径
- `listFiles()` 获取文件列表，会把当前目录下所有的文件和文件夹返回成一个 File 数组
- `mkdir()` 创建目录（文件夹）
- `mkdirs()` 创建多级目录（文件夹）
- `delete()` 删除文件或文件夹，delete 只能删除空的文件夹，如果文件夹有内容，则删除失败返回 false
- `renameTo()` 重命名文件

## 常用 API / IO
