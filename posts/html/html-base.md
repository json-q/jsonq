# html 元素

## 列表

### 有序列表 ol

- 有序列表，直接子元素只能是 li
- li（list item）
- 列表中的每一项

```html
<style>
  ol,
  li {
    /* 0 可以去掉默认的数字序号 */
    margin: 0;
    padding: 0;
    /* 可以去掉数字后的 .  */
    list-style: none;
  }
</style>
<ol>
  <li>银魂</li>
  <li>命运石之门</li>
  <li>死亡笔记</li>
</ol>
```

> 浏览器会自动加上序号 1. 2. 3.

### 无序列表 ul

```html
<style>
  ul {
    /* decimal 可以将无序列表变为有序列表 */
    /* none 去掉默认的 . */
    list-style-type: decimal;
  }
</style>
<ol>
  <li>银魂</li>
  <li>命运石之门</li>
  <li>死亡笔记</li>
</ol>
```

> 无序列表默认会自动加上 ·

### 定义列表 dl dt dd

- dl（definition list）
  - 定义列表，直接子元素只能是 dt、dd
- dt（definition term）
  - term 是项的意思, 列表中每一项的项目名
- dd（definition description）
  - 列表中每一项的具体描述，是对 dt 的描述、解释、补充
  - 一个 dt 后面一般紧跟着 1 个或者多个 dd

```html
<dl>
  <dt>React</dt>
  <dd>jsx</dd>
  <dd>react-router-dom</dd>
  <dd>dva</dd>
  <dd>redux</dd>

  <dt>Vue</dt>
  <dd>vue-router</dd>
  <dd>vuex</dd>
  <dd>pinia</dd>
</dl>
```

## table

表格最常见元素:

- table 表格
- tr(table row) 表格中的行
- td(table data) 行中的单元格

> table 存在很多被弃用的属性：`align`（表格如何对齐）、`bgcolor`（表格背景色）、`border`（表格边框样式）、`cellpadding`（单元格与边框之间的间距）、`cellspacing`（单元格之间的间距）、`frame`、`rules`、`summary`、`width`（表格宽度）

详情请参照 MDN 文档 [table 弃用的属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/table#%E5%BC%83%E7%94%A8%E7%9A%84%E5%B1%9E%E6%80%A7)

![table基本使用](https://static.jsonq.top/2024/10/18/160803663_0cd664db-6457-4ef4-839a-491285f36fd4.jpg)

`border-collapse: collapse;` 来决定 border 的边框是合并的

### table 语义化标签

- thead 表格的表头
- tbody 表格的主体
- tfoot 表格的页脚
- caption 表格的标题
- th 表格的表头单元格

```html
<table>
  <caption>
    热门股票
  </caption>
  <thead>
    <tr>
      <td>排名</td>
      ...
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      ...
    </tr>
    ...
  </tbody>
  <tfoot>
    <tr>
      <td>其它1</td>
      ...
    </tr>
  </tfoot>
</table>
```

### 单元格合并

- 跨列合并: 使用 colspan
  - 在最左边的单元格写上 colspan 属性, 并且省略掉合并的 td;
- 跨行合并: 使用 rowspan
  - 在最上面的单元格协商 rowspan 属性, 并且省略掉后面 tr 中的 td;

```html
<table>
  <tr>
    <!-- 跨列合并几列就写几，合并列后边通常不再有td -->
    <td colspan="2">1-1</td>
  </tr>
  <tr>
    <td>2-1</td>
    <!-- 跨行合并，应提前看 tr 对应的td -->
    <td rowspan="2">2-2</td>
  </tr>
  <tr>
    <td>3-1</td>
  </tr>
</table>
```

<pre>
<table>
  <tr>
    <!-- 跨列合并几列就写几，合并列后边通常不再有td -->
    <td colspan="2">1-1</td>
  </tr>
  <tr>
    <td>2-1</td>
    <!-- 跨行合并，应提前看 tr 对应的td -->
    <td rowspan="2">2-2</td>
  </tr>
  <tr>
    <td>3-1</td>
  </tr>
</table>
</pre>

## 表单元素

常见表单元素：

- form 表单, 一般情况下，其他表单相关元素都是它的后代元素
- input 单行文本输入框、单选框、复选框、按钮等元素
- textarea 多行文本框
- select、option 下拉选择框
- button 按钮
- label 表单元素的标题

### input 元素

input 元素有如下常见的属性:

- type：input 的类型

  - text：文本输入框（明文输入）
  - password：文本输入框（密文输入）
  - radio：单选框
  - checkbox：复选框
  - button：按钮
  - reset：重置
  - submit：提交表单数据给服务器
  - file：文件上传

- readonly：只读
- disabled：禁用
- checked：默认被选中
  - 只有当 type 为 radio 或 checkbox 时可用
- autofocus：当页面加载时，自动聚焦
- name：名字
  - 在提交数据给服务器时，可用于区分数据类型
- value：取值

type 类型的其他取值和 input 的其他属性, [查看 MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Input)

#### 布尔属性

- 常见的布尔属性有 disabled、checked、readonly、multiple、autofocus、selected
- 布尔属性可以没有属性值，写上属性名就代表使用这个属性
  - 如果要给布尔属性设值，值就是属性名本身

```html
<input type="text" readonly />
<!-- 等价于 -->
<input type="text" readonly="readonly" />
```

#### 表单按钮

- 普通按钮（type=button）：使用 value 属性设置按钮文字
- 重置按钮（type=reset）：重置它所属 form 的所有表单元素（包括 input、textarea、select）
- 提交按钮（type=submit）：提交它所属 form 的表单数据给服务器（包括 input、textarea、select）

```html
<input type="button" value="普通按钮" />
<input type="reset" value="重置按钮" />
<input type="submit" value="提交按钮" />
<!-- 等价于 -->
<button type="button">普通按钮</button>
<button type="reset">重置按钮</button>
<button type="submit">提交按钮</button>
```

**label 和 input 的联系**

label 的 for 和 input 的 id 相同，点击 label 即可聚焦 input

```html
<label for="username"> 用户： <input id="username" type="text" /> </label>
<label for="password"> 密码： <input id="password" type="password" /> </label>
```

#### radio 的使用

- type 设置为 radio 变成单选框:
- name 值相同的 radio 才具备单选功能
- value 是表单获取到传给后台的值

```html
<label for="male"> <input id="male" type="radio" name="sex" value="male" />男 </label>
<label for="female"> <input id="female" type="radio" name="sex" value="female" />女 </label>
```

#### checkbox 的使用

- 将 type 类型设置为 checkbox 变成多选框:
- 属于同一种类型的 checkbox，name 值要保持一致
- checked 默认选中

```html
<label for="song"> <input id="song" type="checkbox" name="hobby" value="song" checked />唱 </label>
<label for="jump"> <input id="jump" type="checkbox" name="hobby" value="jump" />跳 </label>
```

#### textarea 的使用

- textarea 的常用属性:
  - cols：列数
  - rows：行数
- 缩放的 CSS 设置
  - 禁止缩放：resize: none;
  - 水平缩放：resize: horizontal;
  - 垂直缩放：resize: vertical;
  - 水平垂直缩放：resize: both;

#### select 和 option 的使用

- multiple 多选
- size 多选时展示的数量，默认全部展示
- selected 默认选中的数据

```html
<select name="fruits" id="" multiple size="2">
  <option value="apple" selected>苹果</option>
  <option value="banana">香蕉</option>
  <option value="orange">橘子</option>
</select>
```
