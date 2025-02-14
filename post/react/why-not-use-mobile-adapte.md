# 移动端适配的看法

看了很多关于移动端适配的方案，是否选择移动端适配，有以下几个观点：

- 该应用只可以在移动端使用，比如 app，
- 如果是 h5 页面，且可以电脑访问的，**尽量放弃移动端适配方案**，不适合

## 为什么放弃移动端适配

首先需要明白，什么是移动端适配。为了兼顾不同机型，在不同的比例下访问时，呈现的布局是一致的，网上大部分是 `rem + flexable` 或者 `viewport`，你问他们为什么，其实他们也说不出来，只是前人（比如淘宝团队）就是这么做的。

---

**但是这有一个很致命的缺陷，由于适配，大小屏幕下，会对字体，布局等进行像素转换**。此时有一个疑问？<span style="color:blue;">我拿大屏幕手机难道不是为了看到更多的内容？为什么是让我看到更大的字？</span>~~（PS：这句话我开玩笑说过，同事也都笑了，连我自己都觉得好笑）~~

如果对以上文字描述的感觉并不明显，查看以下图片即可。

![image](https://static.jsonq.top/2024/10/21/174809663_92edeecb-50cd-432b-920e-4771b5b52aab.png)

该项目来源于 `alitajs`，由 umi 团队人员，基于 `umijs` 实现的移动端开箱即用的框架，内置了移动端适配（rem 方案）。整体架构风格和 `@umijs/max` 差不多。左侧是以电脑访问的，三个 `ListItem` 就占满了整个电脑屏幕，而在移动端则是很正常的显示，对比非常明显，电脑端体验极差！！！这也是为什么最终不采用移动端适配的原因。

## 何时采用移动端适配，不适配时如何保证布局的自适应

对我来说，除非该应用只在移动端能够访问，否则就尽量不采用适配方案。(电脑的类似大屏项目也是同理) 在不做移动端适配时，又要保证布局不会乱掉。在开发过程中，尽量使用 `flex` 布局，让布局跟随浏览器自动分布，不写死尺寸，这样就能保证 h5 和 PC 的视觉效果是一致的。

也可以在限制 PC 端的显示宽度，相当于虽然 PC 访问，但还是手机的布局效果。

# 项目技术总结

## 技术选型

公司以 react 技术栈为主，所以就正常选用 react 来开发。

- Vite
  - `alitajs` 是最开始准备使用的，但就如我上边说的，只能在移动端使用，但我们的项目是需要可以在 PC 访问使用的，在尝试过后就 pass 掉了。
  - 考虑到后续的项目迭代后的编译速度，采用了当前热门的 `Vite`
- JavaScript
  - 作为后续可能经常迭代的项目，并没有选择当前大火的 `TypeScript`，这也和团队开发人员的水平相关，选择适合项目交付的技术才是重中之重，**千万不要以自己的标准去衡量团队的所有人员**，不然 `TypeScript` 就变成了 `AnyScript`，虚有其表。
- react-vant
  - 最初选择的是 `antd-mobile`，因为是 `antd` 的忠实用户，但是部分 UI 在 移动端的展示效果不佳，有点丑，折腾过后改用了 `react-vant`，不得不说，`react-vant` 提供的组件数量和功能比 `antd-mobile` 要好一些。
- tailwindcss
- signature_pad
  - 签字功能使用的，简单调研了一下相关库，该库是在 GitHub 拥有相当高的 star，且近期仍在维护的，不依赖于任何框架。
- lodash-es
  - `lodash` 的 ESModule，体积会减小很多

其他像 `eslint` `prettier` 这些耳熟能详的代码规范约束就不多介绍了，网上大把教程。

## Vite 约定式路由

Vite 生态中已有相关的库，就不自己手写了，文档清晰明了，用法很简单。[vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)

### 约定式路由规则

1. 文件 `index` 不会显式声明为 `/index` 路由，而是根路由 `/`
2. `[...all].(jsx|tsx)` 为 404 页面
3. 支持单文件路由（`pages/test.jsx`=>`/test`）和文件夹嵌套路由（下方示例）

### 约定式路由举例

`src/pages/users/center/index.jsx` ==> `/users/center` `src/pages/users/[id].jsx` ==> `/users/:id` `src/pages/[user]/settings.jsx` -> `/:user/settings` 当 `/my/:id` 和 `/my/center` 同时存在时，优先匹配 `/my/center`，匹配不到的会走入 `/my/:id`

### vite.config.js

可以在 `vite.config.js` 中对该库进行配置，此处仅做简单配置，更多配置可参考 [github 地址]()

```js
    plugins: [
      react(),
      Pages({
        extensions: ['jsx', 'tsx'],  // 只识别 jsx tsx 结尾的文件注册为路由
        exclude: ['**/components/**'], //在 components 下的所有文件都不会被注册为路由
      }),
    ],
```

### 使用

```js
import { Suspense, useReducer } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import LazyLoading from './loading';

function App() {
  return <Suspense fallback={<LazyLoading />}>{useRoutes(routes)}</Suspense>;
}

export default App;
```

### Vite 生态其他约定式路由库

可尝试使用 `vite-plugin-react-pages`，[github 地址](https://github.com/vitejs/vite-plugin-react-pages) 该库由 `vitejs` 官方维护，支持 react 和 mdx，但是更偏向 SSR。

> 为什么不用官方库？因为在查找市面上 vite-react 相关的约定式路由，第一时间并未找到该库（使用频率较低），后续在查看 `vitejs` 官方项目时才看到，有需要的可以尝试该库。

[generouted](https://github.com/oedotme/generouted)。该库也有相当高的 start，功能和 `vite-plugin-react-pages` 差不多，且最近一直在更新维护。

## 错误边界

页面中的异常错误会导致整个页面白屏，体验相当不好，且若复现不出也无法排查，而 react 提供了错误边界，以便能够捕获错误，知道错误的内容。

> 也可以直接使用 `react-error-boundary` 库

```js
import { Clear } from '@react-vant/icons';
import PropTypes from 'prop-types';
import { Component } from 'react';

/**
 * 处理（页面/组件）的异常错误，由于 hooks 中没有错误边界的生命周期，此组件采用 class 写法
 */
class ErrorBoundary extends Component {
  state = { hasError: false, errorInfo: '' };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <Clear fontSize={60} color="var(--rv-danger-color)" />
          <div className="my-2 text-xl">意外错误</div>
          <div className="break-all px-4">{this.state.errorInfo}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

export default ErrorBoundary;
```

该组件可以全局应用，也可以局部对某个组件应用。

```js
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

内部的错误大概就是这样的，这种在出现意外报错时，可以第一时间排查错误来源，而不是白屏无从查起

![image](https://static.jsonq.top/2024/10/21/174809821_d9a99630-2627-4583-81a5-c8924272023c.png)

## 签字组件封装

基于 `signature_pad` 库，集成了常用的签字版功能，且该库不依赖任何框架，可以在 `react` `vue` 等诸多前端框架中使用。更多配置参考 [github 地址](https://github.com/szimek/signature_pad)

```js
import PropTypes from 'prop-types';
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import { Button, Space, Toast } from 'react-vant';
import SignaturePad from 'signature_pad';

/**
 * 签字版，提供六个按钮，默认展示清空和撤销按钮，向外提供 验证空 和 获取 base64/svg 图片的函数
 */
const SignatureCanvans = forwardRef((props, ref) => {
  const {
    className = '',
    saveType = 'png',
    onSave,
    showClear = true,
    showErase,
    showSave,
    showUndo = true,
  } = props;

  const canvasRef = useRef(null);
  let signInstance = null; // 记录当前创建的 cavans 实例

  useImperativeHandle(ref, () => ({
    isEmpty: () => signInstance.isEmpty(), // 验证是否为空，由外部验证时使用
    toDataURL: () => saveToImgOrSvg(), // 获取 base64/svg 图片
  }));

  useEffect(() => {
    createSign();
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      signInstance.clear();
    };
  }, [canvasRef.current]);

  const createSign = () => {
    if (!canvasRef.current) return;
    signInstance = new SignaturePad(canvasRef.current, {
      backgroundColor: 'rgb(255, 255, 255)', // 保存为 png/svg 时，需要设置，撤销时，也会重置为该背景色
    });
  };

  /**
   * 自适应 cavasns 布局
   */
  const resizeCanvas = () => {
    if (!canvasRef.current) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1); // 设备像素比，普通显示器通常为 1，高分辨率可能 2 或者更高
    canvasRef.current.width = canvasRef.current.offsetWidth * ratio; // 宽高根据像素比设置，避免模糊
    canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
    canvasRef.current.getContext('2d').scale(ratio, ratio);
  };

  const onClearClick = () => signInstance.clear();

  const onEraseClick = () => (signInstance.compositeOperation = 'destination-out');

  const onDrawClick = () => (signInstance.compositeOperation = 'source-over');

  const onUndoClick = () => {
    const data = signInstance.toData();
    if (data.length == 0) return;
    data.pop(); // 移除最后一次签字线
    signInstance.fromData(data);
  };

  const onSaveClick = () => {
    if (signInstance.isEmpty()) return Toast.info({ message: '未提供签字内容' });
    const data = saveToImgOrSvg();
    onSave?.(data);
  };

  // 生成 base64/svg 图片
  const saveToImgOrSvg = () => {
    let data = null;
    if (saveType !== 'svg') {
      data = signInstance.toDataURL(`image/${props.saveType}`);
    } else {
      const url = signInstance.toDataURL('image/svg+xml');
      atob(url.split(',')[1]);
      data = url;
    }

    return data;
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`h-full w-full border-[1px] border-solid border-gray-200 bg-white ${className}`}
      />
      <Space block wrap justify="between" className="mt-1 px-2">
        {[
          { showProp: showClear, type: 'danger', label: '清空', onClick: onClearClick },
          {
            showProp: showErase,
            type: 'primary',
            plain: true,
            label: '擦除',
            onClick: onEraseClick,
          },
          { showProp: showErase, type: 'success', label: '绘制', onClick: onDrawClick },
          { showProp: showUndo, type: 'warning', label: '撤销', onClick: onUndoClick },
          { showProp: showSave, type: 'primary', label: '保存', onClick: onSaveClick },
        ]
          .filter((item) => item.showProp)
          .map((btn) => (
            <Button
              key={btn.label}
              type={btn.type}
              size="small"
              plain={btn.plain}
              onClick={btn.onClick}
            >
              {btn.label}
            </Button>
          ))}
      </Space>
    </>
  );
});

SignatureCanvans.displayName = 'SignatureCanvans';
SignatureCanvans.propTypes = {
  className: PropTypes.string,
  saveType: PropTypes.oneOf(['png', 'jpeg', 'svg']),
  showClear: PropTypes.bool, // 清除 default true
  showErase: PropTypes.bool, // 擦除，和绘制同步，有擦除必须有绘制 default false
  showUndo: PropTypes.bool, // 撤销 default true
  showSave: PropTypes.bool, // 保存 default false
  onSave: PropTypes.func, // 保存事件，回传 base64 图片
};

export default memo(SignatureCanvans);
```

完整使用功能代码如下

```js
import SignatureCavans from '@/components/SignatureCavans';
import { useRef } from 'react';
import { Button } from 'react-vant';

function SIG() {
  const signatureRef = useRef();

  return (
    <div style={{ width: '100%', height: 400 }}>
      <SignatureCavans
        ref={signatureRef}
        showErase
        showSave
        onSave={(data) => {
          console.log(data);
        }}
      />
      <Button
        className="mt-5"
        type="primary"
        onClick={() => {
          console.log('isEmpty', signatureRef.current?.isEmpty());
          console.log('base64', signatureRef.current?.toDataURL());
        }}
      >
        调用ref instance
      </Button>
    </div>
  );
}

export default SIG;
```

![image](https://static.jsonq.top/2024/10/21/174809889_370004f7-94b9-4201-9c26-63b6cfd25a2a.png)

## 移动端 select 实现

这里必须多 bb 两句，select 搜索框在移动端真的很反人类，常用于 web 端，但是功能又很好用，没有好的替代，只能做一个需求实现，支持单选和多选。由于以一个常规需求去写，额外拓展了很多内容，代码较多。

```js
import EmptyIcon from '@/assets/icons/common/empty.svg';
import { cloneDeep, debounce } from 'lodash-es';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { Cell, Checkbox, Empty, Field, Loading, Popup, Radio, Search, hooks } from 'react-vant';
import styles from './index.module.css';

SelectPicker.propTypes = {
  // static
  recordKey: PropTypes.string, // 唯一key,循环 key 标识,默认 id
  label: PropTypes.string,
  placeholder: PropTypes.string,
  toolbarTitle: PropTypes.string,
  multiple: PropTypes.bool, // 是否多选
  selectedVisible: PropTypes.bool, // 仅单选状态下有效，选中后自动关闭 Popup，不触发 onOpen 事件，默认 false
  searchPropName: PropTypes.oneOf(['text', 'value']), // 搜索时匹配的字段，默认 value
  fieldNames: PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.string,
  }), // 字段别名，默认 {text: 'text', value: 'value'}
  prefixIcon: PropTypes.node, // Select 每一行的文字前缀图标

  // state
  loading: PropTypes.bool,
  options: PropTypes.array, // 格式：[{text:"", value:""}]

  // event
  onCellChange: PropTypes.func, // 点击 cell 时，回传选中的最新的 values 和 options
  onSearchRender: PropTypes.func, // 自定义搜索，必须 return 过滤的新的 options
  onOpen: PropTypes.func, // 打开弹窗/关闭弹窗，回传 boolean
};

function SelectPicker(props) {
  const {
    // static
    recordKey = 'id',
    label,
    placeholder = '请选择',
    toolbarTitle,
    multiple = false,
    selectedVisible = false,
    searchPropName = 'value',
    fieldNames = {},
    prefixIcon,

    // state
    loading = false,
    options = [],

    // event
    onCellChange,
    onOpen,
    onSearchRender,
  } = props;
  const { text = 'text', value = 'value' } = fieldNames;

  const [visible, setVisible] = useState(false);
  const [searchState, setSearchState] = hooks.useSetState({
    value: null,
    filterList: options, // 搜索过滤的数据
  });
  const [cellState, setCellState] = hooks.useSetState({
    cellValues: multiple ? [] : undefined, // cell 选中值 value
    cellItems: multiple ? [] : undefined, // cell 选中项 item
  });

  /** 点击 cell 选中 checkbox/radio */
  const toggleCell = (item) => {
    const cloneCellState = cloneDeep(cellState);
    if (!multiple) {
      selectedVisible && setVisible(false);
      setCellState({ cellValues: item[value], cellItems: item });
      onCellChange?.(item[value], item);
      return;
    }

    const index = cloneCellState.cellValues.findIndex((el) => el == item[value]);
    // 选中取反
    if (index > -1) {
      const newCellValues = cloneCellState.cellValues.filter((el) => el !== item[value]);
      const newcellItems = cloneCellState.cellItems.filter((el) => el[value] !== item[value]);

      onCellChange?.(newCellValues, newcellItems);
      setCellState({ cellValues: newCellValues, cellItems: newcellItems });
    } else {
      const { cellValues, cellItems } = cloneCellState;
      cellValues.push(item[value]);
      cellItems.push(item);

      onCellChange?.(cellValues, cellItems);
      setCellState({ cellValues, cellItems });
    }
  };

  const onSearch = (value) => {
    if (!value) setSearchState({ value, filterList: [...options] });
    // 本地搜索
    if (onSearchRender) {
      // 自定义搜索内容
      const filterData = onSearchRender(value);
      setSearchState({ value, filterList: filterData || [] });
    } else {
      const propName = searchPropName === 'text' ? text : value;
      setSearchState({
        value,
        filterList: options.filter((el) => el[propName].includes(value)),
      });
    }
  };

  // 控制 popup 显示隐藏
  const togglePopup = (visible) => {
    setVisible(visible);
    onOpen?.(visible);
  };

  return (
    <>
      <Field
        label={label}
        value={
          multiple
            ? cellState.cellItems?.map((el) => el[text]).join(', ')
            : cellState.cellItems?.[text]
        }
        onClick={() => togglePopup(true)}
        type="textarea"
        autoSize
        rows={1}
        isLink
        readOnly
        placeholder={placeholder}
      />

      <Popup
        overlay
        round
        safeAreaInsetBottom
        position="bottom"
        visible={visible}
        onClose={() => togglePopup(false)}
        className={`h-[50%] ${loading ? 'overflow-y-hidden' : 'overflow-y-auto'}`}
      >
        <div className="sticky left-0 top-0 z-10 bg-white">
          <div className={styles['sel-picker__toolbar']}>
            <button
              type="button"
              className={styles['sel-picker__cancel']}
              onClick={() => togglePopup(false)}
            >
              取消
            </button>
            <div className={`${styles['sel-picker__title']} rv-ellipsis`}>{toolbarTitle}</div>
            <button
              type="button"
              className={styles['sel-picker__confirm']}
              onClick={() => setVisible(false)}
            >
              确认
            </button>
          </div>
          <Search
            onChange={debounce(onSearch, 200)}
            value={searchState.value}
            onClear={() => setCellState({ value: null })}
            clearable
            placeholder="请输入搜索关键词"
          />
        </div>

        <div className="h-[calc(100% -98px)]">
          {/* cell 列表 */}
          {multiple ? (
            <Checkbox.Group className="relative" value={cellState.cellValues}>
              <Cell.Group>
                {searchState.filterList.map((item) => (
                  <Cell
                    key={item[recordKey]}
                    clickable
                    onClick={() => toggleCell(item)}
                    title={item[text]}
                    icon={prefixIcon}
                    rightIcon={<Checkbox name={item[value]} shape="square" />}
                  />
                ))}
              </Cell.Group>
            </Checkbox.Group>
          ) : (
            <Radio.Group className="relative" value={cellState.cellValues}>
              <Cell.Group>
                {searchState.filterList.map((item) => (
                  <Cell
                    key={item[text]}
                    clickable
                    onClick={() => toggleCell(item)}
                    title={item[text]}
                    icon={<UserO />}
                    rightIcon={<Radio name={item[value]} />}
                  />
                ))}
              </Cell.Group>
            </Radio.Group>
          )}

          {/* 检索为空，显示一个占位提示 */}
          {searchState.filterList.length === 0 && (
            <Empty imageSize={80} image={<img src={EmptyIcon} />} description="暂无数据" />
          )}

          {/* 外部 loading 控制是否显示遮罩 */}
          <div
            className={`${
              loading ? 'flex' : 'hidden'
            } absolute bottom-0 left-0 right-0 top-0 z-10 items-center justify-center bg-white/90`}
          >
            <Loading type="spinner" color="var(--rv-picker-loading-icon-color)" vertical>
              加载中
            </Loading>
          </div>
        </div>
      </Popup>
    </>
  );
}

export default memo(SelectPicker);
```

对应的 css 文件

```css
.sel-picker__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
}

.sel-picker__title {
  max-width: 50%;
  font-weight: 500;
  font-size: 16px;
  line-height: 60px;
  text-align: center;
}

.sel-picker__cancel,
.sel-picker__confirm {
  height: 100%;
  padding: 0 16px;
  font-size: 14px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.sel-picker__cancel {
  color: #969799;
}

.sel-picker__confirm {
  color: #576b95;
}
```

效果图如图所示：

![image](https://static.jsonq.top/2024/10/21/174809988_efcf45af-0f34-41ee-829e-ac711a7024b0.png)

## 简易 redux

小型项目，没有大量的数据缓存的情况下，可以直接使用 `useReducer` 和 `useContext` 实现一个全局的状态管理

### context 核心内容

```js
import { merge } from 'lodash-es';
import { createContext } from 'react';

/** 简易 redux */
export const AppContext = createContext();

// action
export const ACTION_TYPE = {
  SET_MOBILE_MENU: 'MOBILE_MENU',
  SET_MOBILE_NOTICE: 'MOBILE_NOTICE',
};

// initState
export const initialState = {
  mobileMenu: [],
  mobileNotice: [],
};

// reducer
export function appReducer(preState, action) {
  const { type, payload } = action;

  switch (type) {
    case ACTION_TYPE.SET_MOBILE_MENU:
      return merge(preState, { mobileMenu: payload || [] });

    case ACTION_TYPE.SET_MOBILE_NOTICE:
      return merge(preState, { mobileNotice: payload || [] });

    default:
      return preState;
  }
}
```

### 结合 useReducer 使用 Context.Provider

```js
import { Suspense, useReducer } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import ErrorBoundary from './components/ErrorBoundary';
import { AppContext, appReducer, initialState } from './context';
import LazyLoading from './loading';

function App() {
  const [store, dispatch] = useReducer(appReducer, initialState);

  return (
    <Suspense fallback={<LazyLoading />}>
      <ErrorBoundary>
        <AppContext.Provider value={{ store, dispatch }}>{useRoutes(routes)}</AppContext.Provider>
      </ErrorBoundary>
    </Suspense>
  );
}

export default App;
```

### 使用

组件或者页面内是使用

```js
import { ACTION_TYPE, AppContext } from '@/context';
import { lazyFetch } from './data/mock';

export default function Index() {
  const { store, dispatch } = useContext(AppContext); // store 就是所有的存储数据集

  const getMenuList = async () => {
    const data = await lazyFetch(); // 请求回来的数据存储到 context 中
    dispatch({
      type: ACTION_TYPE.SET_MOBILE_MENU,
      payload: data,
    });
  };

  return <>{JSON.stringfy(store)}</>;
}
```
