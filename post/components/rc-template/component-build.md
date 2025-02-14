---
title: 从零到一构建并打包 React + TypeScript + Less组件库系列（二、组件库编译多产物及文档编写）
date: 2024-11-14 11:45
---

上篇文章我们将组件库的基本结构和规范进行了整理，本篇的核心基本全在 components 文件夹下

本章节由于内容较多，分成了两次 commit

- [打包 es 和 lib 以及样式](https://github.com/json-q/rc-library-templete/commit/c9d8a53c26d1189cd05939f57d07b07bfd2c1642)
- [初始化 storybook 测试打包产物和打包 umd 产物](https://github.com/json-q/rc-library-templete/commit/1af4b5316ee2da0ed4febc69e28c19e166d6b5c9)

# 安装组件开发依赖

## react 和 react-dom 依赖集成

- `package.json` 文件的 peerDependencies 写入 react react-dom

```json
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
```

执行 `pnpm install`

为什么是 `peerDependencies` 而不是 `devDependencies`？

`peerDependencies` 可以约束使用该包的宿主环境，控制其兼容依赖的版本在指定范围内，而 `devDependencies` 则是纯粹的开发依赖

- 安装 `react` 和 `react-dom` 的 types 类型包

```bash
pnpm i @types/react @types/react-dom -D
```

## clsx

安装 `clsx` 作为样式开发的库，其它用到了再安装即可

```bash
pnpm i clsx -D
```

# 编写 less 样式

- 在 `componets/src` 下新建 `style` 文件夹
- 新建 `index.less` 作为入口文件
- 新建 `normalize.less` 重置样式，直接去 [arco design 仓库](https://github.com/arco-design/arco-design/blob/main/components/style/normalize.less) 拷贝下来即可。
- `style` 文件夹下新建 `themes` 文件夹，在 `themes` 下新建 `default.less`，声明一些默认 less 变量

```less
// packages/components/src/style/themes/default.less

@prefix: rclt;

@font-family:
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  PingFang SC,
  Hiragino Sans GB,
  noto sans,
  Microsoft YaHei,
  Helvetica Neue,
  Helvetica,
  Arial,
  sans-serif;

@font-size-body: 14px;

@line-height-base: 1.5715;
```

- 在 `index.less` 中引入 `default.less` 和 `normalize.less`

```less
@import './themes/default.less';
@import './normalize.less';
```

此时的文件结构应该是这样的

```txt
- packages
  - components
    - src
      - style
        - themes
          - default.less
        - index.less
        - normalize.less
```

写这么多是为了在后续编译 less 样式时能看出明显的效果。

# 编写测试组件 Button

代码我就不列出来了，大家可以自行编写，或者去仓库看也可以，就是一个简单的示例组件，编写完成后，目录结构如下

![image](https://static.jsonq.top/2024/11/17/223339889_511aae30-3ea6-4fe7-96e2-f2f9433a1175.png)

- 由于样式后续要做按需导入，所以必须确保每个组件的样式 style 有一个导出的 index.(ts|js) 文件和 index.less 文件
- index.(ts|js) 的内容就是 `@import xxx.less`

**在 `src/index.ts` 中统一导出组件**

```js
export type { ButtonProps } from "./button/interface";
export { default as Button } from "./button";
```

# 打包编译

- 导出类型声明文件
- 导出 umd esmodule commonjs 3 种形式产物供使用者引入；
- 支持样式文件 css 引入，而非只有 less，减少使用者的接入成本；
- 支持按需加载。

## 导出类型声明文件

`tsconfig.json` 上一节已经写好了，直接使用 tsc 编译即可。

执行命令之前需按照 `cpr`，执行 `pnpm i cpr -D`

```json
  "scripts": {
    "build:types": "tsc -p tsconfig.json --outDir es  && cpr es lib"
  },
```

这个命令就是单纯用 tsc 编译出了类型 `d.ts` 文件导出到 `es` 文件夹里，`cpr es lib` 就是将 es 中的 `d.ts` 文件拷贝到了 `lib` 目录下，此时执行 `pnpm build:types` 即可看到生成这两个文件夹

其实大部分 npm 包需要做的都是编译，打包基本用不到。

## 导出 commonjs 代码

打包这个工作，`rollup` 也可以，不过我们是编译，不是打成 bundler，而且还要处理 css，`rollup` 就不是很容易处理了。如果是直接打 bundler 的话，`rollup` 更简单，而且 `webpack` 在这方面也很在行。

### babel 相关配置

安装 babel 及其相关依赖，这一部分解释性的话术引用自下方的参考文章。

```bash
pnpm i @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-transform-runtime -D
```

```bash
pnpm i @babel/runtime-corejs3
```

新建 `.babelrc.js`，写以下内容

```js
module.exports = {
  presets: ['@babel/env', '@babel/typescript', '@babel/react'],
  // @babel/plugin-transform-runtime 的 helper 选项默认为 true
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
        helpers: true,
      },
    ],
  ],
};
```

关于 `@babel/plugin-transform-runtime` 与 `@babel/runtime-corejs3`：

- 若 helpers 选项设置为 true，可抽离代码编译过程重复生成的 helper 函数（`classCallCheck`, `extends` 等），减小生成的代码体积；
- 若 corejs 设置为 3，可引入不污染全局的按需 polyfill，常用于类库编写（更推荐：不引用 polyfill，转而告知使用者需要引入何种 polyfill，避免重复引入或产生冲突，后面会详细提到）。
- 更多参见官方文档 [@babel/plugin-transform-runtime](https://babeljs.io/docs/babel-plugin-transform-runtime)

为了避免转译浏览器原生支持的语法，新建 `.browserslistrc` 文件，根据适配需求，写入支持浏览器范围，作用于 `@babel/preset-env`。（该文件最终只会作用于 css，后续会有相关解释）

```txt
> 1%
last 2 versions
Firefox ESR
not dead
IE 11
not IE 10
```

#### polyfill 相关思考

很遗憾的是，`@babel/runtime-corejs3` 无法在按需引入的基础上根据目标浏览器支持程度再次减少 polyfill 的引入。

这意味着 `@babel/runtime-corejs3` 甚至会在针对现代引擎的情况下注入所有可能的 polyfill：不必要地增加了最终捆绑包的大小。

对于组件库（代码量可能很大），建议将 polyfill 的选择权交还给使用者，在宿主环境进行 `polyfill`。若使用者具有兼容性要求，自然会使用 `@babel/preset-env` + `core-js` + `.browserslistrc`进行全局 polyfill，这套组合拳引入了最低目标浏览器不支持 API 的全部 polyfill。

所以组件库不用画蛇添足，引入多余的 polyfill，写好文档说明，比什么都重要。

现在 `@babel/runtime-corejs3` 更换为 `@babel/runtime`，只进行 helper 函数抽离。

```bash
pnpm uni @babel/runtime-corejs3

pnpm i @babel/runtime
```

`.babelrc.js`

```js
module.exports = {
  presets: ['@babel/env', '@babel/typescript', '@babel/react'],
  // @babel/transform-runtime 的 helper 选项默认为 true
  plugins: ['@babel/plugin-transform-runtime'],
};
```

### gulp 任务编排

安装 gulp 相关依赖

```bash
pnpm i gulp gulp-babel @types/gulp @types/gulp-babel -D
```

**注意：** `gulp-babel` 目前存在问题，当 `.browserslistrc` 内不支持 IE 时会报错，详情可见 [issue](https://github.com/babel/gulp-babel/issues/217)

新建 `gulpfile.js`，写入以下内容

```js
const gulp = require('gulp');
const babel = require('gulp-babel');

const paths = {
  dest: {
    lib: 'lib',
    esm: 'es',
    dist: 'dist',
  },
  compileStyles: 'src/**/index.less', // 编译样式的入口文件，后续会解释为什么样式处理分成两部分
  copyStyles: 'src/**/*.less', // 样式文件路径
  scripts: ['src/**/*.{ts,tsx,js,jsx}'], // 脚本文件路径
};

function compileCJS() {
  const { dest, scripts } = paths;
  return gulp.src(scripts).pipe(babel()).pipe(gulp.dest(dest.lib));
}

// 并行任务 后续加入样式处理 可以并行处理
const build = gulp.parallel(compileCJS);

exports.build = build;

exports.default = build;
```

有 eslint 报错，不允许 `require` 导入，去 `eslint.config.mjs` 关闭一下

```js
    rules: {
      // ...
      '@typescript-eslint/no-require-imports': 'off',
    },
```

去 `package.json` 添加脚本命令 `clean:build` `build`

```json
  "scripts": {
    "build:types": "tsc -p tsconfig.json --outDir es  && cpr es lib",
    "clean:build": "rimraf lib es dist",
    "build": "npm run clean:build && npm run build:types && gulp"
  },
```

**由于 `rimraf` 基本子包都要使用，就安装的根目录的依赖下全局共享**

```bash
pnpm i rimraf -D -w
```

然后执行命令 `pnpm build`，就能在 lib 目录下看到 commonjs 的代码了，且诸多 helper 方法已被抽离至 `@babel/runtime` 中

![image](https://static.jsonq.top/2024/11/17/223340246_2f9ca046-d64f-42bf-8d8d-9308919fc59c.png)

## 导出 ESM 代码

### 修改 babel 配置

为了让 ES Module 更好的支持 [Tree Shaking](https://webpack.docschina.org/guides/tree-shaking/)，需要对 babel 配置做一些改动

- 关闭 `@babel/preset-env` 对模块语法的转换，即设置 `modules` 为 false
- 但是又需要只针对 esm，所以就根据环境变量做一个区分，esm 环境下才关闭（当任务执行时，设置当前的执行环境即可）

```js
module.exports = {
  presets: ['@babel/env', '@babel/typescript', '@babel/react'],
  // @babel/plugin-transform-runtime 的 helper 选项默认为 true
  plugins: ['@babel/plugin-transform-runtime'],

  env: {
    esm: {
      presets: [['@babel/env', { modules: false }]],
    },
  },
};
```

### gulp 新增 esm 构建任务

esm 和 cjs 都走 babel 编译，流程基本一致，可以将编译方法抽离出去，两个任务共用

```js
// ...

/**
 * 编译脚本文件
 * @param {("esm"|"cjs")} babelEnv babel环境变量
 * @param {String} destDir 目标目录
 */
function compileScripts(babelEnv, destDir) {
  const { scripts } = paths;
  process.env.BABEL_ENV = babelEnv;

  return gulp.src(scripts).pipe(babel()).pipe(gulp.dest(destDir));
}

/**
 * 编译cjs
 */
function compileCJS() {
  const { dest } = paths;
  return compileScripts('cjs', dest.lib);
}

/**
 * 编译esm
 */
function compileESM() {
  const { dest } = paths;
  return compileScripts('esm', dest.esm);
}

// 串行执行编译脚本任务（cjs,esm） 避免环境变量影响 gulp.series(compileCJS, compileESM)
// 并行任务 后续加入样式处理 可以并行处理  gulp.parallel(...)
const build = gulp.parallel(gulp.series(compileCJS, compileESM));

// ...
```

执行 `pnpm build`，观察 es 目录下的编译结果，都是 `import` 的 esm 写法

![image](https://static.jsonq.top/2024/11/17/223340665_aad1c3ab-3fa5-46a3-a950-94df174cb669.png)

## Less 样式处理

- 了解流行组件库的样式为什么会是那样的结构
- 模仿流行组件库的样式结构进行编译，实现样式的按需加载

### 为什么是 less？而非 sass 或 css in js？

- 个人更对 less 熟悉一些，所以是 less 而不是 sass
- 对于 cssinjs，个人不喜欢
  - 好处就是定制化极为方便，而且由于是 js，完全不用在编译时处理样式，自动带有 `tree shaking`，文章后续对样式的编译处理什么的统统没有
  - 被人诟病的就是性能，虽说抛开剂量谈毒量都是扯淡，但真拿剂量说事儿时一问一个不吱声。
  - 此处就稍微吐槽一下 `antd5`，cssinjs 性能做得真的很有问题，组件文档打开速度相对于 v4 来说不知道慢了多少倍（加载时大量的 style 标签动态插入），issue 里也经常有人反映性能问题。
  - 虽说有些零运行时的 cssinjs，但是那些随机类名个人看着也确实不舒服。

### 了解流行组件库的样式打包构成

这里就举例国内采用同样技术的组件库：[antd 4.x](https://github.com/ant-design/ant-design/tree/4.x-stable)、[arco design](https://github.com/arco-design/arco-design)、[tdesign](https://github.com/Tencent/tdesign-react) ，可以参考一下他们的打包后的结构目录

![image](https://static.jsonq.top/2024/11/17/223340800_1402814b-3720-4327-a3ef-2a2f1f0b8665.png)

可以看到以上组件库的样式结构基本都一样（tdesign 直接使用 `cssvar`，但是对外提供了 less 能力），提供了 `index.js`（内部是 less 文件的导入）、`css.js`（内部是 css 文件的导入）`index.css`（内部是合并后的纯 css）以及原样的 less 文件

为什么要做的这么麻烦，给用户提供这么多种格式的 css/less 样式文件？组件库底层抹平差异，改善用户体验。

- 提供 less 文件是为了给使用 less 的用户提供主题定制的能力（变量覆盖）
- 提供 css 是为了兼容非 less 用户的使用，可以直接导入 css 而无需额外装 `less-loader`，属于 dx 优化。
- 灵活的样式类型拆分可以给开发者更多的选择，选择 less 还是 css 进行开发都是可以的。
- 拆分成多种类型的入口文件，还可以让用户做**按需导入**，
- 由于要灵活配置，所以开发的组件内部是不能直接导入样式的（不然的话就是写死样式，就不存在多个样式类型的引入方式），样式导入交给用户去做

### 拷贝 less 文件至打包目录

将上述的 less 打包结构理解之后，就可以按照这种结构开始打包样式了。

将开发中使用的 less 文件拷贝至 npm 包中，用户使用时，就可以按需引入 less 文件，也可以做 less 变量的覆盖。

在 `gulpfile.js` 中新建 `copyLess` 任务

```js
/**
 * 拷贝less文件
 */
function copyLess() {
  return gulp.src(paths.copyStyles).pipe(gulp.dest(paths.dest.lib)).pipe(gulp.dest(paths.dest.esm));
}

// gulp.parallel 的 args 是同时执行，gulp.series 的 args 是一个执行完毕执行下一个
const build = gulp.parallel(gulp.series(compileCJS, compileESM), copyLess);
```

可以看到 less 样式已经按照原来的结构 copy 到 es 和 lib 包中，然后就是生成 css 的步骤。

![image](https://static.jsonq.top/2024/11/17/223340928_a6ba4fe6-c10f-43f2-9e3f-5a82014e8db1.png)

### less 编译成 css

安装相关依赖，`gulp-less` 将 less 编译成 css，`gulp-autoprefixer` 添加 css 前缀，由于之前设置了 `.browserslistrc`，`gulp-autoprefixer` 会自动识别兼容的版本去添加前缀

```bash
pnpm i gulp-less gulp-autoprefixer@^8 @types/gulp-less @types/gulp-autoprefixer -D
```

必须安装 `gulp-autoprefixe` 8.x，9.x 只支持 esm 导入。

在 `gulpfile.js` 中新增编译方法

```js
/**
 * 生成css文件
 */
function less2css() {
  return gulp
    .src(paths.compileStyles)
    .pipe(less()) // 编译 less 文件
    .pipe(autoprefixer()) // 根据 browserslistrc 增加前缀
    .pipe(gulp.dest(paths.dest.lib))
    .pipe(gulp.dest(paths.dest.esm));
}

const build = gulp.parallel(gulp.series(compileCJS, compileESM), copyLess, less2css);
```

执行 `pnpm build`，检查打包文件，如图所示就是成功的。

![image](https://static.jsonq.top/2024/11/17/223341041_918756ac-f4f7-4bd3-89e4-2bb9e59515a1.png)

这里没有对 css 进行压缩，esm 和 lib 会被用户以 npm 方式使用，用户打包时，自然会对 css 进行压缩。

#### 为什么只对 `index.less` 进行编译？

- 每个组件的样式都需要一个合并起来的入口文件，这个文件里引入了该组件所需的所有 less 样式，方便开发者导入。
- 如果每个 less 都进行编译，那 `index.less` 编译出来的就是该组件所有的 css，然后其余的拆分组件也会再编译对应的 css，相当于重复编译了
  - `index.less` 编译后具有全量的该组件 css
  - `index.less` 引用了 `a.less`，`a.less` 再次被编译成 css，这个是没有意义的，反而造成了重复编译
  - 最大的问题是，如果所有 `less` 都进行编译，在编译完 `index.less` 后，会去单独编译其它的 less 文件，如果这些文件内使用了的 less 变量是通过 `index.less` 间接引入的，而 `gulp-less` 将其视为独立文件，就会产生 less 变量未定义的错误。

如果以上文字解释看不太明白，可以看如下举例：

```less
// var.less
@font-size: 14px // component.less
  .cp{
  font-size: @font-size;
};

// index.less
@import './var.less';
@import './component.less';
```

这种情况下，`component.less` 使用了 `var.less` 的变量，但文件内没有直接导入 `var.less`，而是使用 `index.less` 做了间接使用，所以 `component.les` 是不具备独立编译的能力的。

如果全部 less 文件都做编译

- `gulp-less` 在编译 `index.less` 时，由于有引入顺序，相当于把 `var.less` 和 `component.less` 做了合并，这种是完全没问题的，可以正常编译。
- `gulp-less` 编译完 `index.less`，再去编译 `component.less`，发现内部有一个未知的 less 变量，因为此时 `gulp-less` 不通过 `index.less` 这个桥梁走，而是直接编译 `component.less`，那自然会报错。

### 生成 css.js

生成 css.js 让不安装 less 插件的用户也可以正常使用。

功能实现参考 [antd-tools](https://github.com/ant-design/antd-tools)，由于 antd5 现在不使用 less 了，就直接找到之前的 commit 把代码贴出来了，如下图所示

![image](https://static.jsonq.top/2024/11/17/223341121_739a8081-2811-4f43-8140-baf303fc733b.png)

这段代码做的就是匹配到 `style/index.js` 时，生成 `style/css.js`，并通过正则将文件内容中引入的 less 文件后缀改成 css。

- 安装 `through2`

```bash
pnpm i through2 -D
```

对 `compileScripts` 进行补充

```js
/**
 * 编译脚本文件
 * @param {("esm"|"cjs")} babelEnv babel环境变量
 * @param {String} destDir 目标目录
 */
function compileScripts(babelEnv, destDir) {
  const { scripts } = paths;
  process.env.BABEL_ENV = babelEnv;

  return gulp
    .src(scripts)
    .pipe(babel())
    .pipe(
      through2.obj(function (file, encoding, next) {
        this.push(file.clone());

        if (file.path.match(/(\/|\\)style(\/|\\)index\.js/)) {
          const content = file.contents.toString(encoding);
          file.contents = Buffer.from(cssInjection(content)); // 文件内容处理
          file.path = file.path.replace(/index\.js/, 'css.js'); // 文件重命名
          this.push(file); // 新增该文件
          next();
        } else {
          next();
        }
      }),
    )
    .pipe(gulp.dest(destDir));
}
```

其中的 `cssInjection` 实现，还是在 `gulpfile.js` 中

```js
/**
 * 当前组件样式 import './index.less' => import './index.css'
 * 依赖的其他组件样式 import '../test-comp/style' => import '../test-comp/style/css.js'
 * 依赖的其他组件样式 import '../test-comp/style/index.js' => import '../test-comp/style/css.js'
 * @param {String} content
 */
function cssInjection(content) {
  return content
    .replace(/\/style\/?'/g, "/style/css'")
    .replace(/\/style\/?"/g, '/style/css"')
    .replace(/\.less/g, '.css');
}
```

执行 `pnpm build`，即可看到 `css.js` 文件

![image](https://static.jsonq.top/2024/11/17/223341190_6ca81d69-a1c6-4150-aad0-ed18cb837296.png)

> 其实这一部分很多可以优化的地方，做的更细致一点，大家在看懂之后可以自行尝试优化，比如 `token.css` 并不存在（`token.less` 未被编译），可以去掉，再比如可以把 less 变量编译 cssvar，`css.js` 可以再额外引入 css 变量，就可以做到动态换肤功能。

### 按需加载

实际上只要结构上写出来，按需加载的核心就已经完成了。

在 `package.json` 中增加 `sideEffects` 属性，配合 ES module 达到 `tree shaking` 效果（将样式依赖文件标注为 side effects，避免被误删除）。

cssinjs 的库都不需要这个，因为 cssinjs 只有 js，天然支持 `tree shaking`。

```json
  "sideEffects": [
    "dist/*",
    "es/**/style/*",
    "lib/**/style/*",
    "**/*.less"
  ],
```

好，此时按需加载的步骤就已经完成了，大家如果用 webpack，可以借助 [`babel-plugin-import`](https://github.com/umijs/babel-plugin-import) 实现按需导入样式，如果是 vite，可以使用 [`vite-plugin-imp`](https://github.com/onebay/vite-plugin-imp)

**以上内容作为一次 [commit](https://github.com/json-q/rc-library-templete/commit/c9d8a53c26d1189cd05939f57d07b07bfd2c1642) 暂存一下**

### 整理 package.json 的入口以及导出模块的方式和指向

```json
{
  "main": "lib/index.js",
  "module": "es/index.js",
  "types": "es/index.d.ts",

  "files": ["dist", "es", "lib"],
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "require": "./lib/index.js",
      "import": "./es/index.js"
    },
    "./es/*": "./es/*",
    "./lib/*": "./lib/*",
    "./dist/*": "./dist/*"
  },
  "sideEffects": ["dist/*", "es/**/style/*", "lib/**/style/*", "**/*.less"]
}
```

除了 `sideEffects` 之外，其它的简单介绍一下：

- `files` 就是发布到 npm 时包含的文件
- `main`、`module`、`types` 分别指向不同环境下的不同包，`types` 是在 TS 环境下的地址指向
- `exports` 字段内和 `main`、`module`、`types` 作用差不多，只不过可以更细粒度的去区分

其实 `exports` 是用来替代 `@babel/plugin-transform-runtime` 的 `useESModules` 的（对导出这块我也不是很熟，同样是查资料和摸索出来的）

![image](https://static.jsonq.top/2024/11/17/223341258_65761bf6-cc2f-4917-9f0e-943c10bbbd9d.png)

而后边又添加了 `./es/*": "./es/*` 等的指向，是因为我在使用按需加载的过程中发现插件无法从 `./es` 中读取文件，找不到文件路径，而且编辑器无法给出路径提示（看样子确实是没有指定到文件下），所以才有了这一系列的指向，大家可以去掉之后自行尝试一下。

### 新增组件实时编译能力

本地使用组件库时，当修改了组件想要看到最新效果，就只能重新 `pnpm build` 打包，这显然很不方便，好在 `gulp` 提供了相关的实时编译支持。

`gulpfile.js`

```js
// 监视 src 目录下的文件变化
function watchFiles() {
  gulp.watch('src/**/*', build);
}

exports.watch = watchFiles;
```

`package.json` 添加 dev 命令

```json
  "scripts": {
    "dev": "gulp watch",
    // ...
  },
```

后续执行 `pnpm dev`，当 src 下的组件发生变化，就会自动重新编译

> 这个实时编译不太好用，编译方是没问题的，使用方经常无法及时得到响应。

# 安装 storybook 验证打包成果

上一章节我们把 monorepo 的基本文件结构搭建好了，storybook 是直接处于根目录下的子包，此时在该目录下执行初始化命令，暂时不要选择 `Next`，因为 SSR 环境下目前不确定是否会发生意外情况

```bash
pnpm dlx storybook@latest init
```

安装之后会自动打开页面，这个我们暂时先不关心，因为我们是测试组件的打包，所以先安装组件依赖

```bash
pnpm add rclt-components --workspace
```

storybook 分两个运行界面，一个是 vite + react 默认的模板页面，就是 `src` 下的文件，这个也可以作为自己的组件库文档进行开发。一个是根据 `*.storeis.(tsx|...)` 生成的 storybook 文档。

## 测试组件可用性

在 `App.tsx` 中导入组件

![image](https://static.jsonq.top/2024/11/17/223341376_7534dc5c-7319-41c8-b55c-94cd560cbf5b.png)

运行 `pnpm dev`，打开即可看到一个很丑的按钮 button，因为没有样式，接下来我们做样式的按需导入

## 测试样式的按需加载

安装 `vite-plugin-imp`

```bash
pnpm i vite-plugin-imp -D
```

在 `vite.config.ts` 中增加配置

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import vitePluginImp from 'vite-plugin-imp';

export default defineConfig({
  resolve: {
    // sb 打包时，由于组件库为本地目录，sb 找不到路径会打包错误，需使用 alias 指向正确路径
    alias: {
      'rclt-components': fileURLToPath(new URL('../packages/components', import.meta.url)),
    },
  },
  plugins: [
    react(),
    vitePluginImp({
      libList: [
        {
          libName: 'rclt-components',
          style: (name) => `rclt-components/es/${name}/style/index.css`,
        },
      ],
    }),
  ],
});
```

此时一个漂亮的按钮就成功出来了

![image](https://static.jsonq.top/2024/11/17/223341468_6ea47e8e-ac77-437c-a0c4-220ea2fd9d80.png)

> 这么看来在项目结构搭建时可以把 `storybook` 作为根目录作为项目共享的配置，这样可以直接在 `components` 文件夹下写 story 文档，结构上更方便查看

## 编写文档

storybook 的约定文件格式可以在 `main.ts` 中看到，我们把它进行稍加修改

```js
const config: StorybookConfig = {
  docs: {
    autodocs: true,
  },
  stories: ["../src/**/index.stories.@(js|jsx|mjs|ts|tsx)"],
};
```

- `autodocs` 就是用来全局配置 stories.ts 中的 `tags:["autotag"]`
- `stories` 的路径现在只匹配 `index.stories`，是为了当文档示例过多时，以 `index.stories` 作为入口，其余可以导入进来，条理更清晰一点。

删除 `stories` 下的所有文件，新建 button 文件夹，新建 Button 组件的 story 文档

```jsx
// storybook/stories/button/index.stories.tsx

import { Button } from "rclt-components";
import type { Meta, StoryObj } from "@storybook/react";
// export {OtherButton} from "./source/other-button.store"

const meta = {
  title: "基础组件/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonType: Story = {
  name: "按钮类型",
  render: () => (
    <div style={{ display: "flex", gap: "10px" }}>
      <Button type="default">Default Button</Button>
      <Button type="primary">Primary Button</Button>
      <Button type="danger">Danger Button</Button>
    </div>
  ),
};

export const ButtonSize: Story = {
  name: "按钮大小",
  render: () => (
    <div style={{ display: "flex", gap: "10px" }}>
      <Button type="primary" size="small">
        Small Button
      </Button>
      <Button type="primary">Default Button</Button>
      <Button type="primary" size="large">
        Large Button
      </Button>
    </div>
  ),
};
```

执行 `pnpm storybook`，运行 storybook 文档

![image](https://static.jsonq.top/2024/11/17/223341533_7df52261-d20d-4173-a7a8-67c08864a2b2.png)

样式的按需加载也被 storybook 文档享受到了，不需要单独导入 css。

# 打包 umd 格式的组件 bundler

umd 可以直接在浏览器环境使用，各大组件库基本都提供有 umd 格式的组件产物。

这里使用的是 webpack 打包 umd，没有选择 rollup，大家根据喜好选择即可，这个比较简单。

## webpack 打包 bulder

安装 webpack 相关依赖和打包用到的 loader：

```bash
pnpm i webpack webpack-cli webpack-merge terser-webpack-plugin babel-loader ts-loader -D
```

在 `components` 下新建 `webpack` 文件夹，思路如下

- dist 包提供两个 bundler 产物，一个压缩过的 `min.js` 和未压缩的 `.js`
- dist 包提供两个 css 产物，一个压缩过的 `min.css` 和未压缩的 `.css`

在 `webpack` 下新建三个文件 `webpack.common.js`、`webpack.dev.js`、`webpack.prod.js`

在 `webpack.common.js` 写入以下内容

```js
const path = require('path');

/** @type {import("webpack").Configuration} */
module.exports = {
  bail: true,
  // devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
  },
  output: {
    // filename: 'jwstwe-ui.min.js',
    path: path.join(__dirname, '../dist'),
    library: 'rclt',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /.js(x?)$/,
        use: [{ loader: 'babel-loader' }],
        exclude: /node_modules/,
      },
      {
        test: /.ts(x?)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },

  // 组件库不直接集成 react 和 react-dom
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
};
```

`webpack.dev.js` 实际上就是来打包未压缩版本的产物

```js
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');

/** @type {import("webpack").Configuration} */
const devConfig = {
  mode: 'development',
  output: {
    filename: 'rclt.js',
  },
};

module.exports = merge(devConfig, commonConfig);
```

`webpack.prod.js` 打包压缩版本的产物

```js
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const commonConfig = require('./webpack.common');

/** @type {import("webpack").Configuration} */
const prodConfig = {
  mode: 'production',
  output: {
    filename: 'rclt.min.js',
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};

module.exports = merge(prodConfig, commonConfig);
```

在 `package.json` 添加命令 `build:dist` 命令

```json
  "scripts": {
    // ...
    "build:dist": "webpack --config ./webpack/webpack.dev.js && webpack --config ./webpack/webpack.prod.js",
    // ...
  },
```

执行 `pnpm build:dist`，就可以看到生成了 `dist` 文件夹

![image](https://static.jsonq.top/2024/11/17/223341597_acc9ccf6-ee3d-4871-b2fb-d3329fe80ae1.png)

### 细节优化

- webpackbar 打包进度条
- case-sensitive-paths-webpack-plugin 文件大小写敏感检测（不同平台的路径兼容）

```bash
pnpm i webpackbar case-sensitive-paths-webpack-plugin @types/case-sensitive-paths-webpack-plugin -D
```

在 `webpack.common.js` 中添加

```js
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WebpackBarPlugin = require('webpackbar');

/** @type {import("webpack").Configuration} */
module.exports = {
  // ...
  plugins: [new CaseSensitivePathsPlugin(), new WebpackBarPlugin()],
};
```

## 打包 css

`webpack` 就算安装 `less-loader` ，想打包出 css，也是完全没用的，因为 less 样式是完全独立的，组件内部不引入样式，`webpack` 在打包时，完全找不到使用的 less，自然就打包不出来。

其实也是因为有更简单的方法。

之前是怎么编译 css 的？gulp 使用 `gulp-less` 将 less 编译成 css 分别输出到产物目录下，那也可以顺便再生成一下 `dist`的 css

先安装 [`gulp-concact`](https://github.com/gulp-community/gulp-concat) 合并文件， [`gulp-cleaner-css`](https://github.com/andre487/gulp-cleaner-css) 压缩 css（是 [`gulp-clean-css`](https://github.com/scniro/gulp-clean-css) 的一个维护分支）

```bash
pnpm i gulp-concact @types/gulp-concact gulp-cleaner-css -D
```

完善 `gulpfile.js`

```js
/**
 * 生成css文件
 */
function less2css() {
  return gulp
    .src(paths.compileStyles)
    .pipe(less()) // 编译 less文件
    .pipe(autoprefixer()) // 根据browserslistrc增加前缀
    .pipe(gulp.dest(paths.dest.lib))
    .pipe(gulp.dest(paths.dest.esm))
    .pipe(concat('rclt.css'))
    .pipe(gulp.dest(paths.dest.dist))
    .pipe(cleanCSS()) // 压缩 CSS
    .pipe(concat('rclt.min.css'))
    .pipe(gulp.dest(paths.dest.dist)); // 输出压缩版到 dist
}
```

此时 dist 的 css 也可以生成了。回到 `package.json`，将 `build` 命令里添加 `build:dist`

```json
{
  "scripts": {
    "dev": "gulp watch",
    "build": "npm run clean:build && npm run build:types && gulp && npm run build:dist",
    "build:types": "tsc -p tsconfig.json --outDir es  && cpr es lib",
    "build:dist": "webpack --config ./webpack/webpack.dev.js && webpack --config ./webpack/webpack.prod.js",
    "clean:build": "rimraf lib es dist"
  }
}
```

执行 `pnpm build`，如图所示，就大功告成了

![image](https://static.jsonq.top/2024/11/17/223341649_0e6ef236-f595-4f38-a20c-fa2e317abfe3.png)

> 其实 webpack 打包 dist 这块不用拆分出 `dev` 和 `prod` 两个文件，可以将配置项作为一个函数，通过传参判断构建的产物类型，作为构建脚本执行会更合适。

## 测试 dist

新建一个 `test-dist.html`，引入 react、react-dom、babel 的 umd 链接

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="stylesheet" href="./packages/components/dist/rclt.min.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin></script>
  <script src="./packages/components/dist/rclt.min.js"></script>
  <script type="text/babel">
    const { Button } = rclt;

    function App() {
      return (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button type="default">Button</Button>
          <Button type="primary">Button</Button>
          <Button type="danger">Button</Button>
        </div>
      );
    }
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</html>
```

![image](https://static.jsonq.top/2024/11/17/223341707_9850ad46-9998-4c64-89b0-85a6b6e353d3.png)

组件库的打包到此结束！同时期待阅读这篇文章的你有更深入的优化

# 参考

[React 组件库搭建指南（三）：编译打包](https://github.com/worldzhao/blog/issues/5)
