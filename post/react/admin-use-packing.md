---
title: React 后台系统的部分业务封装
date: 2024-03-21
---

本文记录在工作过程中，开发后台管理系统时，自己对部分业务的一些封装。本文的业务封装涉及的技术栈为 Antd + ProComponent + zustand

> `ProComponent` 相较于 `Antd` 来说，使用曲线更为陡峭，且本文不介绍基础用法，仅结合业务来实现功能。

# 权限

由于此项目的权限精度并没那么高，后台采用 `ACL` 权限控制而不是 `RBAC`，仅根据角色来判断权限，因此可能无法适配所有业务场景，但是可以参考思路。

此处封装了两个权限的模块，一个 **hook**，一个**权限组件**

- **权限组件**是基于 **hook** 进行的封装，内容极其简单。
- hooks 的封装通常用于页面内部，**权限组件**无法满足场景需要。即：需要使用权限参与业务逻辑的场景

## 权限 hook

项目内使用的是 zustand 作为数据管理，`redux`、`@redux/toolkit` 也是同理

```ts
import useAllStores from '@/stores';

/**
 * 当前用户权限默认为数组，根据入参身份进行权限判断
 * @param access 权限 string | string[]
 * @returns boolean 有权限则为 true
 */
const useAccess = (access: UserAPI.Auth | UserAPI.Auth[]) => {
  // store 中的用户权限，若不是该格式，可以在存入 store 之前做处理，或者对 useAccess 的逻辑做处理
  const currentUser = useAllStores((state) => state.currentUser);
  const auth = currentUser?.auth || [];

  return useMemo(() => {
    if (auth.length === 0) return false;

    if (typeof access === 'string') {
      return auth.includes(access);
    } else if (Array.isArray(access)) {
      return access.some((item) => auth.includes(item));
    }
    return false;
  }, [access, auth]);
};

export default useAccess;
```

<strong style="color:blue;">代码解读</strong>

- `zustand` 中存储着当前人的角色，比如 `["admin", "person", "pro-admin"]`。
  - 一个人可以有多个角色，对应的权限功能是合并的关系
- 页面中，某个功能模块，只要是角色中含有 `person` 的就可以通过。那么使用 `const access = useAccess("person")` ，若返回 `true`，则证明有权限。
- 页面中，某个功能模块，需要限定 `admin` 或者 `pro-admin` 的角色才能通过，那么使用 `const access = useAccess(["admin", "pro-admin"])`，返回 `true`，则证明有权限。

<strong style="color:blue;">伪代码示例</strong>。结合了 `ProTable` 的 columns，当前拥有 `pro-admin` **或者** `admin` 角色时，才有**操作按钮**的权限。

```ts
function Page(){
    const access = useAccess(["pro-admin", "admin"])

    const columns: ProColumns<TestTable>[] = [
    {
      title: '名字',
      dataIndex: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
    },
    {
      title: '操作',
      valueType: 'option',
      hideInTable: !access,  // 当前人有权限时，才显示该项，否则不显示
      render: (_, record) => (
        <Button type="text" size="small" danger>删除</Button>
      ),
    },
  ];

  return <ProTable {...} />
}
```

## 权限组件

权限组件的功能很简单，被该组件包裹的内容，有权限渲染，无权限则不渲染，和 `@umijs/max` 中提供的 `Access` 组件是一样的效果。当明白 `useAccess` 后，实现该功能很简单

```ts
import useAccess from '@/hooks/useAccess';
import type { FC, PropsWithChildren } from 'react';

interface AccessProps {
  access: UserAPI.Auth | UserAPI.Auth[];
}

const Access: FC<PropsWithChildren<AccessProps>> = ({ access, children }) => {
  const hasAccess = useAccess(access);

  return hasAccess ? children : null;
};

export default Access;
```

<strong style="color:blue;">伪代码示例</strong>。

```ts
import Access from "@/components/Access";

// access 属性支持传入数组，当有多个身份可以访问该内容时，传入数组即可
function Page() {
  return <Access access="admin">我是只有 admin 权限才能看到的内容</Access>;
}
```

# ProComponent 业务封装

## ProFormUploadDragger 组件封装

需求背景：

- 初次上传后，后端返回文件 id
- 表单中文件回显时，需要转换成 `antd` 的格式
- 删除时根据 id 删除文件，所以 id 必须要在显示数据中（不论是初次新建上传的，还是编辑回显的）

![image](https://jsonq.top/cdn-static/2025/02/25/1740465689594-2pgbb4ud.png)

上传组件的封装思路：

![image](https://jsonq.top/cdn-static/2025/02/25/1740476578202-6g6awrqd.png)

### 上传封装

封装后的功能：

- 与项目结合，携带请求头，内置上传地址
- 内置文件上传类型校验（与 accept 保持一致），上传成功/失败捕获并自定义错误提示，**accept 不能使用通配符，需明确校验文件的后缀名**
- 文件上传对接后端，失败的给出对应错误显示
- 文件删除对接后端，其中删除的场景情况较多
  - 上传失败删除，此时不请求后端
  - 初次上传成功就删除，初次的数据和编辑状态的数据是不一样的。
  - 编辑时对已有文件进行删除
- `props` 接收 `ProFormUploadDragger` 的所有 `props` 属性，且所有的 `props` 属性都可覆盖

```ts
import { deleteFileById } from "@/apis/upload";
import { message } from "@/hooks/useAppStatic";
import localCacha from "@/utils/localCacha";
import { ProFormUploadDragger, type ProFormUploadDraggerProps } from "@ant-design/pro-components";
import { Upload } from "antd";
import type { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";

interface ProFormUploadDraggerTokenProps extends ProFormUploadDraggerProps {
  /**
   * 调用删除接口的状态
   * @returns 成功/失败
   */
  requestDelFile?: (status: boolean) => void;
}

const ProFormUploadDraggerToken: React.FC<ProFormUploadDraggerTokenProps> = (props) => {
  const { accept, onChange, requestDelFile } = props;

  /**
   * 文件上传事件，对上传失败的进行处理
   */
  const onChangeFile = (info: UploadChangeParam<UploadFile<R<string>>>) => {
    // 当上传成功后才开始对数据进行校验
    if (info.file.status == "done") {
      const res = info.file.response;
      if (res?.code !== 200) {
        info.file.status = "error";
        // 查看 antd 源码，可自定义错误信息 官方文档并未给出相关内容  message = file.error?.statusText || file.error?.message || locale.uploadError;
        info.file.error = { statusText: res?.msg };
      }
    }
    onChange?.(info);
  };

  /**
   * 对上传前的文件进行校验，是否符合上传要求，不符合的禁止上传并给出提示
   */
  const beforeUploadFile = (file: RcFile) => {
    if (!accept) return true;

    const suffix = file.name.substring(file.name.lastIndexOf("."));
    const supportFile = accept.replace(/\s*/g, "").split(","); // 去除 accept 中的空格

    if (supportFile.length > 0) {
      const validate = supportFile.includes(suffix);
      if (!validate) {
        message.error(`支持上传的文件格式：${accept}`);
        return Upload.LIST_IGNORE;
      }
      return true;
    }
  };

  /**删除图片
   */
  const onRemoveFile = async (file: UploadFile<R<string>>) => {
    // rc- 是通过 antd 初次上传的（自带uid），没有 rc-，证明是回显值（值是文件id或图片url地址）
    // 若上传失败，删除时，直接清除页面文件，不走接口
    if (file.uid.indexOf("rc-") !== -1 && file.response?.code !== 200) return true;

    let fileId = "";
    // response 存在，则证明该文件是未提交的数据（上传，然后删除）
    if (file.response?.data) fileId = file.response.data;
    else fileId = file.uid;

    const { code } = await deleteFileById(fileId);
    requestDelFile?.(code === 200);
    return code === 200;
  };

  return (
    <ProFormUploadDragger
      action={`${import.meta.env.VITE_BASE_URL}/attachments/uploadFile`}
      onChange={onChangeFile}
      {...props}
      fieldProps={{
        name: "file", // 这里可以指定和后端对接的 filename
        headers: {
          "Beaner Authentication": localCacha.get("my-token")!,
        },
        beforeUpload: beforeUploadFile,
        onRemove: onRemoveFile,
        ...props.fieldProps,
      }}
    />
  );
};

export default ProFormUploadDraggerToken;
```

### 上传的工具函数

- 新建使用时，直接拿该组件使用即可
- 提交时，需要对 `antd` 的源数据类型进行转换（后端约定要求传递文件 id，多个 id 逗号分隔）
- 编辑回显时，对后台的数据值进行转换，转成 `antd` 的 `Upload` 组件可识别的格式

**提交时的数据转换，antd 源数据转后端需要的格式**

```ts
/**
 * 根据 Upload value 生成 文件id 或者 imgUrl
 * - 使用场景：初次上传/编辑上传（包括含有编辑初始值的文件，默认的 fileList 识别的是 uid 字段）
 * @param fileList 文件列表值
 * @returns string 文件 id 字符串拼接 / 图片地址字符串拼接
 */
export const getFileIdByUploadValue = (fileList?: UploadFile<R<string>>[]) => {
  if (!fileList) return '';

  const attachmentId = fileList.reduce((accu, curr) => {
    if (curr.response?.data && curr.status !== 'error') {
      return accu.concat(curr.response.data);
    } else if ((curr.response?.data || curr.uid.indexOf('rc-') === -1) && curr.status !== 'error') {
      // 编辑时，没有 response，目前拼接的是 uid 字段
      return accu.concat(curr.uid);
    }
    return accu;
  }, [] as string[]);
  return attachmentId.join(',');
};
```

**编辑回显时，将后端数据转成 antd 需要的格式**

```ts
/**
 * 后端附件转 Upload 数据
 * @param fileData
 * @returns
 */
export const getFileListByFileData = (fileData: FileData[] = []): UploadFile[] => {
  const fileList: UploadFile[] = [];
  fileData.forEach((item) => {
    fileList.push({
      uid: item.id,
      name: item.fileName,
      status: 'done',
      url: `${downloadUrl}/${item.id}`,
    });
  });
  return fileList;
};
```

<strong style="color:blue;">伪代码示例</strong>

```ts
// 也可以通过 form 绑定到 initValues 等属性上边
<ProFormUploadButtonToken
  fieldProps={{
    showUploadList: { showRemoveIcon: false },
    fileList: getFileListByFileData(record.fileData),
  }}
/>
```

# 流文件下载

前端给后端传递文件 id，后端返回文件流

```ts
const downloadUrl = `${import.meta.env.VITE_BASE_URL}/attachments/downloadFile`;

/**
 * @param url 下载地址
 * @param filename 文件名
 */
export const downloadByUrl = (id: string, filename = '', url = downloadUrl) => {
  // 如果后端返回的是 blob，则使用如下两行代码
  // const blob = new Blob([response]);  // response 就是后端返回的 blob
  // const href = window.URL.createObjectURL(blob);
  if (!url || !id) throw new Error('无 url 或 id');
  const spliceUrl = `${url}/${id}`;
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = spliceUrl;
  a.download = filename;
  a.rel = 'noopener noreferrer';
  //  火狐兼容，防止多次下载只会下载第一个
  if (checkBrowser().browser === 'firefox') {
    a.target = '_blank';
  }
  document.body.append(a);
  a.click();
  a.remove();
};

const checkBrowser = () => {
  const ua = navigator.userAgent.toLowerCase();
  const re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/;
  const m = ua.match(re);
  const Sys = {
    browser: m?.[1].replace(/version/, "'safari"),
    version: m?.[2],
  };

  return Sys;
};
```
