---
title: MinIO 常用 API 快速入门
date: 2024-04-25
---

# 快速入门

- [minio 中文网](https://www.minio.org.cn/)
- [minio 官网](https://min.io/)

minio 有开源版和收费版，使用开源版时，若修改了 minio 的源代码，需要将修改后的源代码完全公开。

- 对 minio 有一定了解后，可查看：[SpringBoot 集成 minio 前后端联调（后端集中管理 minio）](/post/java/minio/minio-springboot-use)，实现了前后端的基本文件上传下载。
- 更多大文件的使用方式可查看：[Minio 分片上传、断点续传、分片下载、秒传、暂停（断点）下载](/post/java/minio/minio-slice-upload)，此文章结合业务实现对 minio 多种文件存储方式以及流程分析，同时含有代码示例地址，相信能从中有所收获。

## 启动 minio

minio 文档提供了多个运行环境的安装流程，此处以 windows 为例，其它运行环境文档上都有介绍。[相关文档](https://www.minio.org.cn/docs/minio/windows/index.html)

1. 下载 minio.exe：https://dl.minio.org.cn/server/minio/release/windows-amd64/minio.exe
2. 运行 minio.exe

```bash
# 找到 minio 所在文件地址，运行 minio.exe
.\minio.exe server E:\minio --console-address :9090
```

> `E:\minio` 是项目运行和文件存储的目录 `--console-address` 指定 MinIO Web 控制台 `9090` 是 Web 的运行端口

![image](https://jsonq.top/cdn-static/2025/02/25/1740465685775-ubylgh3d.png)

打开终端显示的地址就能看到 minio 的项目页面（以 `http://localhost` + `端口号`访问更方便），输入终端给出的 user 和 password

## SpringBoot 集成

1. 使用 idea 快速新建一个 SpringBoot 项目，在 pom 中添加 `minio` 的依赖

```java
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.9</version>
</dependency>
```

> maven 依赖的最新版本可在 [Maven Central](https://central.sonatype.com/) 网站中搜索关键词

2. 编写 `MinIOConfig` 配置类

```java
@Configuration
public class MinIOConfig {

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                // 设置服务运行的地址
                .endpoint("http://192.168.202.1:9000")
                // 设置账号名和密码
                .credentials("minioadmin", "minioadmin")
                .build();
    }
}
```

3. 编写 `MinIOService` 类的测试方法

```java
@Service
public class MinIOService {

    @Resource
    private MinioClient minioClient;

    public void testMinIOClient() {
        System.out.println(minioClient);
    }
}
```

4. 在单元测试类中调用 Service 方法，后续的基础使用都在 test 中测试执行

```java
@SpringBootTest
class MinioUseApplicationTests {

    @Resource
    private MinIOService minIOService;

    @Test
    void contextLoads() {
        minIOService.testMinIOClient();
    }
}
```

### 时间误差

如果开发环境和 minio 的环境不再同一个系统环境中，比如开发 windows，minio 运行 linux，此时就可能产生时间误差，调用 minio 的方法就会出现错误。

将 linux 系统时间同步

```bash
# 查看 linux 系统时间，此时和 windows 是有误差的
date
# 安装 ntpdate
yum install ntpdate -y
# 同步时间
ntpdate poll.ntp.org
# 再次查看并对比 windows 时间
date
```

## MinioClient 常用 API

### 操作 Bucket

MinIO 的存储性质和 OSS 一样，都是对象存储。

- `Bucket` 桶：对象存储中的存储空间，相当于文件夹
- `Object` 对象：相当于文件

**1. `bucketExists` 判断桶是否存在**

检查指定的存储桶是否存在，返回布尔，`bucketExists` 传入的是一个 `BucketExistsArgs` 构建器模式，异常抛出

```java
boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket("test").build());

System.out.println("test文件夹是否存在：" + exists);
```

**2. `makeBucket` 创建桶**

创建一个新的存储桶（bucket），没有返回值，`makeBucket` 传入的是一个 `MakeBucketArgs` 构建器模式，创建失败会抛出异常

```java
// 创建完也可以使用 bucketExists 查看是否存在，或者登陆后台网页查看
minioClient.makeBucket(MakeBucketArgs.builder().bucket("test").build());
```

**3. `listBuckets` 所有桶列表**

列出用户有权访问的所有存储桶（buckte），返回存储桶列表

```java
List<Bucket> buckets = minioClient.listBuckets();
buckets.forEach(bucket -> {
    System.out.println("name: " + bucket.name() + "；creationDate: " + bucket.creationDate());
});
```

**4. `removeBucket` 删除桶**

删除存储桶（bucket），没有返回值，`removeBucket` 传入的是一个 `RemoveBucketArgs` 构建器模式，删除失败会抛出异常

```java
minioClient.removeBucket(RemoveBucketArgs.builder().bucket("test").build());
```

### 操作 Object

**1. `putObject` 上传文件到桶中（常用）**

```java
File file = new File("C:\\Users\\j9967\\Downloads\\lifecycle-events.png");
FileInputStream stream = new FileInputStream(file);

ObjectWriteResponse response = minioClient.putObject(PutObjectArgs.builder()
        .bucket("test") // 指定上传的桶
        .object("my-test.jpg") // 上传到桶中之后的文件叫啥名字
        // 文件流，文件大小，分片大小（通常为 -1，自动推断，若手动填写，必须在 5M -5G 之间）
        .stream(stream, file.length(), -1)
        .build());
```

查看 minio 后台页面

![image](https://jsonq.top/cdn-static/2025/02/25/1740465685877-laibrbal.png)

**2. `uploadObject` 上传文件（新方法）**

```java
ObjectWriteResponse response = minioClient.uploadObject(UploadObjectArgs.builder()
        .bucket("test")
        .object("my-test2.jpg")
        .filename("C:\\Users\\j9967\\Downloads\\lifecycle-events.png")
        .build());
```

> 若要上传文件时自动生成的是嵌套文件，可以直接通过 `object` 拼接，minio 本身就支持这种写法。例如`object =  "/a/b/c/my.jpg"` 在 minio 生成的就是嵌套文件目录 `a/b/c`

**3. `statObject` 判断文件是否存在**

如果查不到该文件，会直接报异常，所以 `statObject` 是肯定可以正常返回数据的

```java
StatObjectResponse response = minioClient.statObject(StatObjectArgs.builder()
        .bucket("test") // 查询的桶名
        .object("my-test.jpg") // 文件名字
        .build());
```

**4. `getPresignedObjectUrl` 生成可访问的签名 url 地址**

```java
String url = minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
        .bucket("test")
        .object("my-test.jpg")
        .method(Method.GET)
        .build());
System.out.println(url);
```

可以限制 url 的访问过期时间 `expiry(3, TimeUnit.HOURS)` 指定该链接 3 小时后失效。<span style="color:red;">当指定 `Method.GET` 时，访问该 url 是获取资源，若指定为 `Method.PUT`，则生成的是上传链接，可让前端将文件通过该 url 上传至 minio</span>

> 如果要使用不带签名的访问地址，可直接查看下一小节

**5. `getObject` 用于从存储桶中下载文件**

将桶中的文件下载到 E 盘 code 文件夹中

```java
GetObjectResponse response = minioClient.getObject(GetObjectArgs.builder()
        .bucket("public-readonly-file")
        .object("my-public.jpg")
        .build());
String fileName = response.object();
response.transferTo(new FileOutputStream("E:\\code\\" + fileName));
```

**5. `listObjects` 获取桶中的所有文件**

```java
Iterable<Result<Item>> results = minioClient.listObjects(ListObjectsArgs.builder()
        .bucket("public-readonly-file")
        .build());
for (Result<Item> result : results) {
    Item item = result.get();
    System.out.println(item.lastModified() + "\t" + item.size() + "\t" + item.objectName());
}
```

**5. `removeObject` 删除桶中的文件**

```java
minioClient.removeObject(RemoveObjectArgs.builder()
        .bucket("public-readonly-file")
        .object("my-public.jpg")
        .build());
```

### 公开 url 访问权限

minio 默认生成的 url 是必须携带签名才能访问的，若想要直接访问图片地址，有两种方法

1. 去后台将桶的访问权限由私有 `private` 改为 `public`

![image](https://jsonq.top/cdn-static/2025/02/25/1740465685992-vgfb6v4d.png)

此方式不推荐，任何人不使用用户名和密码认证，都可以对该桶的文件信息上传，下载和删除

2. 使用 `makeBucket` 创建桶后，使用 `setBucketPolicy` 设置访问策略，用户只读权限

**注：** `setBucketPolicy` 设置访问策略的桶必须存在，否则报错

```java
String bucketName = "public-readonly-file";
// 创建桶
minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
// 需要的就是这一串代码访问策略
String policyJsonString = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"PublicRead\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"*\"},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}";
minioClient.setBucketPolicy(SetBucketPolicyArgs.builder()
        .bucket(bucketName)
        .config(policyJsonString)
        .build());
```

![image](https://jsonq.top/cdn-static/2025/02/25/1740465686127-dff2kwoz.png)

此时再向该桶 `public-readonly-file` 中上传文件 `uploadObject`，然后使用 `getPresignedObjectUrl` 获取图片访问地址

![image](https://jsonq.top/cdn-static/2025/02/25/1740465686236-23ipftqu.png)

> 虽然 `getPresignedObjectUrl` 默认生成的还是带签名的地址，但是因为设置了公开读，所以可以去掉
