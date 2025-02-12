对开发 java 时，IDEA 的部分常用代码规范进行设置

# 设置前的注意事项

- 写完代码后，`Ctrl + Alt + L` 格式化代码
- 设置完之后，不要忘记 `Apply` 确认
- 不要在单个项目中设置，全局设置，请关闭项目，在如图所示处设置

![image](https://static.jsonq.top/2024/10/21/171403031_c53d6baf-657a-4055-8a8d-aa63d1d75eb5.png)

# 代码换行

在设置前已经超过代码行宽度限制的代码不会自动换行

<span style="color:red;">个人感觉换行没必要，换行后的代码阅读性并不是很好</span>

## 超过 120 列换行

setting —> Editor -> CodeStyle，在 `Wrap on typing` 打勾即可

![image](https://static.jsonq.top/2024/10/21/171403108_b0aeca2e-acec-40f9-8488-3451696d319d.png)

## 设置代码格式化时自动换行

会把超过 120 列的自动换行，这个是格式化时才会换行，上边的是写代码过程中就会换行

![image](https://static.jsonq.top/2024/10/21/171403247_d1df6c6b-8ad6-48d4-912e-936ed7222e6f.png)

## 开启换行分割线(垂直标尺)

开启后编辑器会出现一个换行的分割线，根据个人喜好设置

![image](https://static.jsonq.top/2024/10/21/171403356_3ea4c14a-e1f4-40c0-8c46-2ab6225aa5f7.png)

# xml 注释顶格

去掉勾选。

![image](https://static.jsonq.top/2024/10/21/171403466_7adb054e-69e0-4f63-bf2a-f9e4e7c4f1c5.png)

# foreach 不换行

![image](https://static.jsonq.top/2024/10/21/171403610_0955af5b-5f4e-4835-8c7f-52c81fc705d4.png)

# UTF-8 设置

## text file encoding 设置为 UTF-8

`Transparent native-to-ascii conversion` 这个功能会将我们输入的所有字符转换成 Unicode 序列码保存，避免 properties 的乱码问题。

`Create UTF-8 files` 选择 `with NO BOM` `UTF-8 BOM` 又叫 UTF-8 签名。`BOM, byte order mark`。

UTF-8 的 BOM 在文件头部，用来标识该文件属于 utf-8 编码，但是 BOM 虽然在编辑器中不显示，但是会产生输出，占用三个字节。

![image](https://static.jsonq.top/2024/10/21/171403782_51600278-09b2-4fd6-9cea-1f39d7b9a4df.png)

## 换行符编码格式为 Unix

IDEA 中文件的换行符使用 `Unix` 格式，不使用 `Windows` 格式。

![image](https://static.jsonq.top/2024/10/21/171403903_fb1cb0f3-30ae-496c-808b-b6f81c69a5af.png)

# 创建文件时自动填入作者时间定制格式

创建文件时，会自动在 class 上方标注的内容，该设置非必需，按需选择即可。

```java
/**
 * @author 作者名字
 * @description
 * @date ${YEAR}/${MONTH}/${DAY}
*/
```

![image](https://static.jsonq.top/2024/10/21/171404002_1a71ca33-027e-4fd4-918e-d2c006e6fe12.png)

# 自动移除未使用的导入

![image](https://static.jsonq.top/2024/10/21/171404105_9ed944ae-4512-49a5-aa5c-bfe6b498be65.png)

# 自动添加导入

<span style="color:blue;">只有不重名的导入名才会自动导入，重名的需手动导入</span>

![image](https://static.jsonq.top/2024/10/21/171404222_8b397233-004f-4c15-8de0-659bdf2302e5.png)

# 注释

## 行注释不放在行首

行注释不放在行首，取消掉这两个勾选

![image](https://static.jsonq.top/2024/10/21/171404362_764255f2-2049-4615-b52f-f398892229ce.png)

## 快捷键注释自动添加空格

使用 `ctrl+/` 快捷键进行行注释时，在行注释 `//` 后自动添加空格

![image](https://static.jsonq.top/2024/10/21/171404512_c369bc05-f7a6-478d-bf74-abfa8d5651bb.png)

## 格式化时，行注释由行首，变成跟随缩进

![image](https://static.jsonq.top/2024/10/21/171404660_4ea92eab-e8c5-45c5-9693-5df6e25ca3af.png)

# 设置 UTF-8 编码(每个新建项目都需要设置)

![image](https://static.jsonq.top/2024/10/21/171404802_c2a49c83-d02f-4b9e-a09b-a779e189fa90.png)

查看右下角，确认是否是 UTF-8，不是则修改设置

![image](https://static.jsonq.top/2024/10/21/171404880_7fc139ab-7947-415a-b26e-3f970312e47d.png)

# 缩进

采用 4 个空格缩进，禁止使用 Tab 字符。 说明：如果使用 Tab 缩进，必须设置 1 个 Tab 为 4 个空格。IDEA 设置 Tab 为 4 个空格时，请勿勾选 `Use tab character`

![image](https://static.jsonq.top/2024/10/21/171404968_5afaa578-fc05-4252-a168-271d3442120c.png)

# 类型强制转换时，右括号与强制转换值之间不需要任何空格隔开

![image](https://static.jsonq.top/2024/10/21/171405128_a6a9559a-40e4-4d47-aa70-c0acc2288a91.png)

# 行注释参数后的描述不对齐

![image](https://static.jsonq.top/2024/10/21/171405291_2998ec48-42ba-4f33-861b-e67872e8645d.png)

# 多行注释格式化后不换行

默认格式化后，多行注释之间是有空行的，不喜可以去掉

![image](https://static.jsonq.top/2024/10/21/171405429_8a6682ba-4b0c-4265-acd8-7c8b09e0746b.png)

# 鼠标滚轮控制试图缩放大小

![image](https://static.jsonq.top/2024/10/21/171405524_9abb2c22-68f7-4230-8278-80fe6b1daeba.png)

# 常用快捷键

- `alt + 左键选中` 可以快速批量选中某些代码片段，快速对其进行更改
- `ctrl + alt + L` 快速格式化代码
- `shift + enter` 换行
- `ctrl + P` 快速弹出参数提示
- `alt + enter` 可以对错误进行快速修复纠正
- `alt + insert` 可以快速生成 get set constructor 等方法。
- `ctrl + R` 可快速弹出搜索框（该文件内搜索），可搜索可替换（也可选中某内容 + `ctrl + R` 即可快速搜索该内容）
