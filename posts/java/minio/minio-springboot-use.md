由后端集中管理 minio 的 SDK 调用，而非前端对接 minio

# 基本配置

## 初始化项目

新建一个 SpringBoot 项目，集成 `lombok` `mybatis-plus` `minio` `hutool-core`（可有可无）。新建一个数据表 `attachement`，用于存储文件上传后在 minio 中的位置。

```sql
drop table if exists attachment;
create table attachment
(
    id               int auto_increment,
    bucket           varchar(32)  not null comment '桶名',
    object           varchar(64)  not null comment 'minio中的文件名',
    origin_file_name varchar(225) not null comment '原始文件名全称',
    create_time      timestamp(6) default current_timestamp(6) comment '创建时间',
    update_time      timestamp(6) on update current_timestamp(6) comment '更新时间',
    primary key (id)
) comment '附件表';
```

## 配置项目

1. 新增 `attachment` 相关的 controller、mapper、entity、service

2. 在 `application.yml` 中声明 minio 的配置项，连接数据库，设置文件上传大小

```yml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/minio?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
  # 允许上传的文件大小限制
  servlet:
    multipart:
      max-file-size: 1000MB
      max-request-size: 1000MB

# minio 自定义配置
minio:
  endpoint: http://127.0.0.1:9000
  accessKey: minioadmin
  secretKey: minioadmin
  bucket: public-readonly-file
```

**注意：** `endpoint` 设置的是 API 地址，而非 WebUI 地址

3. 新增 MinIOConfigInfo 读取 `application` 中的相关配置

```java
@Data
@Component
@ConfigurationProperties(prefix = "minio")
public class MinIOConfigInfo {

        private String endpoint;
        private String accessKey;
        private String secretKey;
        private String bucket;
}
```

4. 新增 `minIOConfig` 配置类

```java
public class MinIOConfig {
    @Resource
    private MinIOConfigInfo minIOConfigInfo;

    @Bean
    public MinioClient minioClient() {
        //链式编程，构建MinioClient对象
        return MinioClient.builder()
                .endpoint(minIOConfigInfo.getEndpoint())
                .credentials(minIOConfigInfo.getAccessKey(), minIOConfigInfo.getSecretKey())
                .build();
    }
}
```

# 图片/文件通用上传

建议把图片上传和文件上传分开，因为图片只关系 url 地址，而文件需要额外知道文件名，且两者的业务场景并不完全相同

## 后端代码

**`Controller`**

```java
    @Resource
    private AttachmentService attachmentService;

    @PostMapping("file")
    public R<String> uploadFile(MultipartFile file) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return attachmentService.uploadFile(file);
    }
```

**`Service`**

1. 获取文件名和后缀，并生成一个随机 uuid
2. `uuid+文件后缀` 用于上传至 minio，防止文件重复。原文件名用于前端文件类的展示
3. 将重命名的图片/文件上传至 minio，**默认访问是直接下载的，上传时对该文件的 `Content-Type` 进行设置，生成的 url 地址才可以预览而不是下载**
4. 上传到 minio 成功后，向数据库插入该文件在 minio 的信息
5. 生成一个可访问的 url 地址返回给前端（具体返回值要根据实际场景结合应用）

```java
    public R<String> uploadFile(MultipartFile file) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        //处理文件，对文件进行重命名并上传到 minio
        String originalFilename = file.getOriginalFilename(); // 原始文件全称
        String suffix = FileUtil.extName(originalFilename); // 文件后缀
        String uuid = IdUtil.simpleUUID(); // 重命名文件名存储到 minio，防止上传的文件名重复
        String renameFile = uuid + "." + suffix;
        // 上传至 minio
        LocalDateTime now = LocalDateTime.now();
        // 文件以年月日的格式分文件夹存储
        String object = now.getYear() + "/" + now.getMonthValue() + "/" + now.getDayOfMonth() + "/" + renameFile;
        minioClient.putObject(PutObjectArgs.builder()
                .bucket(minIOConfigInfo.getBucket())
                .object(object)
                .contentType(file.getContentType())
                .stream(file.getInputStream(), file.getSize(), -1)
                .build()
        );
        // 插入文件数据到表中
        Attachment attachment = new Attachment();
        attachment.setOriginFileName(originalFilename)
                .setBucket(minIOConfigInfo.getBucket())
                .setObject(object)
                .setCreateTime(now);
        attachmentMapper.insert(attachment);
        // 生成图片 url 地址
        // String url = minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
        //         .bucket(minIOConfigInfo.getBucket())
        //         .object(path)
        //         .expiry(1, TimeUnit.MILLISECONDS)
        //         .method(Method.GET)
        //         .build());
        // return R.ok(url);

        // 如果设置了公开只读访问策略，则可以不经过getPresignedObjectUrl生成签名，直接访问即可
        return R.ok(minIOConfigInfo.getEndpoint() + "/" + minIOConfigInfo.getBucket() + "/" + object);
    }
```

> 代码可优化项，封装/校验文件类型，如果 minio 设置了公开访问，可以将 url 带的签名去掉，如何创建**只读策略**的桶，可参考上一篇文章。 **什么是公共只读策略？文件可以不经过用户名密码直接访问，但没有其它访问权限。如果设置 `public`，可以不使用用户名密码，直接使用 SDK 对桶文件进行增删改，十分不安全**

## 前端代码

antd 组件，前端设置了跨域代理，以 `/api` 开头的请求都会代理转发到 `http://localhost:8080` 即后端代码运行地址，如果后端设置 `@CrossOrigin` 则无跨域问题

```jsx
<Upload name="file" action="/api/upload/image" list-type="picture-card">
  Click to Upload
</Upload>
```

前端展示效果

![image](https://static.jsonq.top/2024/10/21/171412293_baadcc36-27ee-493e-95c6-f8b8392d6534.png)

minio 后台文件结构

![image](https://static.jsonq.top/2024/10/21/171412371_695f9be2-8f20-44ef-a739-1ef701b62ba2.png)

url 地址预览（需上传时设置 `Content-Type`）

![image](https://static.jsonq.top/2024/10/21/171412477_c3548771-a8ce-4aa0-a51d-cbfe39a72956.png)

# 文件下载

在有预览功能的前提下，下载是非必须的，但不同的业务场景可能会需要直接下载，不走预览

1. 前端传给后端文件 id
2. 后端根据 id 查询数据库中对应的文件数据
3. 后端根据 bucket 和 object 去 minio 找对应的文件
4. 使用 SDK 下载文件，返回给前端

```java
    @Override
    public void downloadFile(Integer id, HttpServletResponse response) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        Attachment attachment = attachmentMapper.selectById(id);

        if (attachment == null) {
            // 这里可以抛出异常，根据实际业务处理
            System.out.println("文件不存在");
        } else {
            //浏览器直接下载，要设置一下响应头信息
            response.setContentType("application/octet-stream");
            response.setCharacterEncoding("utf-8");
            response.setHeader("Content-disposition",
                    "attachment;filename=" + URLEncoder.encode(attachment.getObject(), StandardCharsets.UTF_8));
            // 下载
            GetObjectResponse getObjectResponse = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(attachment.getBucket())
                            .object(attachment.getObject())
                            .build());
            getObjectResponse.transferTo(response.getOutputStream());
        }
    }
```
