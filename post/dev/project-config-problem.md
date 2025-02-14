# 项目配置问题汇总

## vue+ts 项目使用 unplugin-auto-import 类型为 unknown

这个问题默认已经安装了 `unplugin-auto-import` 及`unplugin-vue-components`，图中是一个使用 vue 脚手架创建的项目，运行后生成了 `components.d.ts`，但是 vue 文件中却缺少类型定义。

![unknown 类型](https://static.jsonq.top/2024/10/23/223258547_image.png)

如果手动在 script 标签中导入组件肯定是没问题的。此时使用 `unplugin-auto-import` 自动导入，类型也确实生成，但是组件上依然为 `unknown`。

**解决方法**

在 `tsconfig.json` 的 `include` 中添加 `components.d.ts`，或者更广泛一点添加 `**/*.d.ts`。

```json
{
  // ...
  "include": ["**/*.d.ts" /** ... */],
  "compilerOptions": {
    // ...
  }
}
```

![类型提示](https://static.jsonq.top/2024/10/23/224645824_image.png)

## 使用 ESlint 报错 'module' is not defined

![错误示例](https://static.jsonq.top/2024/10/23/224935876_image.png)

就是 ESlint 识别不了 node 模块。

- 在 eslint8 中，可以在 .eslintrc.cjs 中添加 `env: { node: true }`
- 在 eslint9 中，可以在 eslint.config.js 的 `languageOptions.globals` 中添加 `globals.node`

```js
// ESlint 8 示例
module.exports = {
  env: { node: true },
};

// Eslint 9 示例，初始化的项目只添加了 browser 模块语法，node 模块需要添加
// globals 存在很多模块，可自行查看
export default [
  {
    languageOptions: {
      // ...
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
```
