> 文档模板：v0.4.2

<p align="center">
  <h1 align="center"> 
    <code>react-native-in-app-review</code>
  </h1>
</p>

本项目基于 [react-native-in-app-review](https://github.com/MinaSamir11/react-native-in-app-review) 开发。

版本所属关系如下：

| 三方库名称 | 三方库版本（npm地址） | 发布信息 | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | 源码地址 |
| ------------ | ------------ | ------------------------------ | ------------- | ------------- |------------------------ | ------------- | ------------- |
| @react-native-ohos/react-native-in-app-review | [~4.4.3](https://www.npmjs.com/package/@react-native-ohos/react-native-in-app-review) | [Github Releases](https://github.com/react-native-oh-library/react-native-in-app-review/releases) | 0.84.* / 0.82.* / 0.77.* / 0.72.* | 是 | API12+ | 4.4.2 | [master](https://github.com/react-native-oh-library/react-native-in-app-review/tree/master) |

## 简介

`react-native-in-app-review` 是一个 **React Native 原生桥接库**（非 UI 组件库），用于在应用内引导用户提交应用商店评分与评论，用户无需跳转到商店详情页即可完成评分流程。

| 平台 | 底层能力 |
|------|---------|
| Android | Google Play In-App Review API |
| iOS | StoreKit `SKStoreReviewController` |
| Android HMS | AppGallery Intent 应用内评论 |
| **HarmonyOS** | AppGalleryKit `commentManager.showCommentDialog`（API 20+） |

**设计原则：**

- 成功 `resolve` **不代表**用户已评分（系统/API 不返回评分结果）
- 应在用户完成核心体验后再触发，避免频繁打扰
- HarmonyOS 上 `RequestInAppReview` 与 `requestInAppCommentAppGallery` 合流为同一原生实现

## 下载安装

进入到工程目录并输入以下命令：

**npm**

```bash
npm install @react-native-ohos/react-native-in-app-review
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-in-app-review
```

> [!TIP] 业务侧 `import` 时使用原库名 `'react-native-in-app-review'`，而非鸿蒙包名 `@react-native-ohos/react-native-in-app-review`（RNOH 工程经 `harmony.alias` 自动映射）。

## Link

| 版本 | 是否支持 Autolink | RN 框架版本 |
|------|------------------|------------|
| ~4.4.3 | 是 | >=0.72 |

使用 AutoLink 的工程需要根据该文档配置，Autolink 框架指导文档：https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过 Manual Link 配置。

<details>
  <summary>Manual Link：此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`。

> **说明**：本模块为 TurboModule，需同时在 C++ 侧和 ETS 侧注册 Package，**无需**注册 ArkUI 自定义组件。

### 1. Overrides RN SDK

为了让工程依赖同一个版本的 RN SDK，需要在工程根目录的 `oh-package.json5` 添加 `overrides` 字段，指向工程需要使用的 RN SDK 版本。

关于该字段的作用请阅读[官方说明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#zh-cn_topic_0000001792256137_overrides)

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.72.38"
    // "@rnoh/react-native-openharmony": "./react_native_openharmony.har"
    // "@rnoh/react-native-openharmony": "./react_native_openharmony"
  }
}
```

### 2. 引入原生端代码

目前有两种方法：

- 通过 har 包引入（推荐）
- 直接链接源码

**方法一：通过 har 包引入（推荐）**

> [!TIP] har 包位于三方库安装路径的 `harmony/in_app_review.har`。

打开 `entry/oh-package.json5`，添加以下依赖：

```json
"dependencies": {
  "@react-native-ohos/react-native-in-app-review": "file:../../node_modules/@react-native-ohos/react-native-in-app-review/harmony/in_app_review.har"
}
```

点击右上角的 `sync` 按钮，或者在命令行终端执行：

```bash
cd entry
ohpm install
```

**方法二：直接链接源码**

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/link-source-code.md)

### 3. 配置 CMakeLists 和引入 InAppReviewPackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```cmake
set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-in-app-review/src/main/cpp" ./in_app_review)

target_link_libraries(rnoh_app PUBLIC in_app_review)
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```cpp
#include "InAppReviewPackage.h"

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
        std::make_shared<InAppReviewPackage>(ctx),
    };
}
```

### 4. 在 ArkTS 侧引入 InAppReviewPackage

打开 `entry/src/main/ets/RNOHPackagesFactory.ets`（或 `RNPackagesFactory.ets`），添加：

```typescript
import InAppReviewPackage from '@react-native-ohos/react-native-in-app-review';

export function createRNOHPackages(ctx: RNPackageContext): RNOHPackage[] {
  return [
    new InAppReviewPackage(ctx),
  ];
}
```

</details>

### 运行

点击右上角的 `sync` 按钮，或者在命令行终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

## 约束与限制

### 兼容性

本文档内容基于以下版本验证通过：

1. RNOH: 0.72.96; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
2. RNOH: 0.72.33; SDK: HarmonyOS NEXT B1; IDE: DevEco Studio: 5.0.3.900; ROM: Next.0.0.71;
3. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
4. RNOH: 0.82.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM:6.0.0.120 SP7;

### 权限要求

- 无需任何权限，无需修改 `module.json5`

### 编译运行 API 要求

> [!TIP] 当前三方库所有版本均已实现版本隔离，支持在 `API12+` 工程编译，及 `API12+` ROM 运行。

> [!TIP] 以下功能依赖特定版本的 API，使用 `低于指定 API 版本的工程编译` 或 `低于指定 API 版本的 ROM 运行` 均可能导致部分功能受限。

1. 应用内评论弹窗依赖 AppGalleryKit `commentManager.showCommentDialog`，起始版本 **HarmonyOS 6.0.0(20)**。低于 API 20 时 `isAvailable()` 返回 `false`，调用走 reject code `'21'`。
2. 内部降级路径 `openAppGalleryDetailPage()` 依赖 `productViewManager.loadProduct`，起始版本 **4.1.0(11)**；`onAppear` 回调起始 **5.0.2(14)**。

## 使用示例

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```tsx
import InAppReview from 'react-native-in-app-review';

if (InAppReview.isAvailable()) {
  InAppReview.RequestInAppReview()
    .then(result => {
      // 弹窗流程完成，HarmonyOS 端 resolve(true)（boolean）
      console.log('流程完成', result);
    })
    .catch((error: {code: string; message: string}) => {
      // 设备不支持时 code='21'；其余为应用评论服务错误码 1021500001~1021500009
      console.log(error.code, error.message);
    });
}
```

## 使用说明

**能力查询（同步）**

```tsx
const available = InAppReview.isAvailable();
// HarmonyOS：canIUse('SystemCapability.AppGalleryService.Distribution.Comment')
// Android：Platform.Version >= 21
// iOS：检测 StoreKit 类是否存在
```

**应用内评分**

```tsx
InAppReview.RequestInAppReview()
  .then(result => console.log(result)) // HarmonyOS: true
  .catch(error => console.log(error.code, error.message));
```

**应用市场应用内评论**

```tsx
// HarmonyOS 上与 RequestInAppReview 同一实现
InAppReview.requestInAppCommentAppGallery()
  .then(result => console.log(result))
  .catch(error => console.log(error.code, error.message));
```

**降级路径（内部 API，不经 InAppReview 类暴露）**

```tsx
import {TurboModuleRegistry} from 'react-native';

const mod = TurboModuleRegistry.get('InAppReviewModule') as {
  openAppGalleryDetailPage(): Promise<boolean>;
} | null;

mod?.openAppGalleryDetailPage()
  .then(ok => console.log('详情页已打开', ok))
  .catch(err => console.log(err.code, err.message));
```

**HarmonyOS 错误码说明**

| Code | 含义 |
|------|------|
| `21` | 设备/API 不支持应用内评论弹窗 |
| `24` | `UIAbilityContext` 不可用 |
| `1021500006` | 未登录华为账号 |
| `1021500007` | 当前版本已评论 |
| `1021500008` | 评论次数达上限（一年内最多 3 次） |
| `1021500009` | 距上次评论不足一年 |

## 接口说明

> [!TIP] "Platform" 列表示该 API 在原三方库上支持的平台。

> [!TIP] "OpenHarmony 平台支持" 列为 yes 表示 OpenHarmony 平台支持该 API；no 表示不支持；partially 表示部分支持或语义映射。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

本库为原生桥接库，**无 UI 组件、无 Props**，对外仅暴露 `InAppReview` 类的静态方法。

### API

| 名称 | 类型 | 参数类型 | 返回值 | 必填 | 平台 | OpenHarmony 平台支持 | 描述 |
|------|------|---------|--------|------|------|---------------------|------|
| isAvailable | function | / | boolean | No | Android, iOS | yes | 同步查询当前设备是否具备应用内评论能力。HarmonyOS 通过 `canIUse` 检测系统能力（API 20+） |
| RequestInAppReview | function | / | Promise\<boolean\> | No | Android, iOS | partially | 拉起应用内评分流程。HarmonyOS 映射为 AppGallery `showCommentDialog`；成功 resolve `true`，不代表用户已评分 |
| requestInAppCommentAppGallery | function | / | Promise\<boolean\> | No | Android (HMS) | yes | 华为应用市场应用内评论。HarmonyOS 上与 `RequestInAppReview` 合流为同一实现；不复现上游 Android 102/103 结果码 |

### 内部 API（TurboModule，未进入 JS 公开面）

| 名称 | 类型 | 参数类型 | 返回值 | 必填 | 平台 | OpenHarmony 平台支持 | 描述 |
|------|------|---------|--------|------|------|---------------------|------|
| openAppGalleryDetailPage | function | / | Promise\<boolean\> | No | — | yes | 降级路径：`productViewManager.loadProduct` 拉起应用市场详情页手动评分（API 11+） |

### 平台差异

| 项 | 上游行为 | HarmonyOS 行为 |
|----|---------|---------------|
| `RequestInAppReview` 成功值 | Android: boolean；iOS: 字符串 `'true'` | 统一 `boolean true` |
| `requestInAppCommentAppGallery` 成功值 | Android HMS: `102`/`103` | 统一 `boolean true` |
| 错误码 | Google Play / HMS Intent 101~108 | 鸿蒙原生 `102150000x`；`21`/`24` 对齐上游编号 |
| Google Play / StoreKit | 各自原生 API | 不支持（平台无关） |

## 快速验证（运行 Example）

### 前置条件

| 依赖 | 版本要求 |
|------|----------|
| Node.js | >= 20 |
| DevEco Studio | 5.0+ / 6.0+ |
| HarmonyOS SDK | API 12+ |

### 运行步骤

**1. 克隆仓库并安装依赖**

```bash
git clone https://github.com/react-native-oh-library/react-native-in-app-review.git
cd react-native-in-app-review
npm install
```

**2. 进入 example 目录，安装依赖**

```bash
cd example
npm install
```

**3. 生成 JS Bundle**

```bash
npm run dev
```

产物：`harmony/entry/src/main/resources/rawfile/bundle.harmony.js`

**4. 用 DevEco Studio 打开鸿蒙工程**

- 打开 `example/harmony` 目录
- 等待 Sync 完成
- 编译并运行 HAP

> **注意**：Example 已预置 Autolink 与 Package 注册；应用内评论弹窗需 **真机** + **API 20+** + 华为账号，模拟器仅能验证 `isAvailable()` 与错误分支。

## 遗留问题

- 应用内评论弹窗（`commentManager`）起始版本 6.0.0(20)，低于该版本需经内部降级 API `openAppGalleryDetailPage()` 拉起详情页手动评分
- 评论弹窗不支持模拟器；真机验证依赖 AGC 注册应用与华为账号登录，错误分支（`code` + `message`）为常态验证面
- 官方 Deep Link 写评论页（`store://…&action=write-review`）未封装，当前仅有 `loadProduct` 详情页降级

## 其他

无

## 目录结构

````
react-native-in-app-review          # 项目根目录
├── harmony                         # 鸿蒙适配代码
│   ├── in_app_review.har           # har 包
│   └── in_app_review               # 鸿蒙适配核心代码
│       ├── index.ets               # 鸿蒙适配代码入口
│       └── src/main/
│           ├── ets/
│           │   ├── InAppReviewModule.ets
│           │   └── InAppReviewTurboModulesFactory.ets
│           └── cpp/                # C++ TurboModule 桥接
├── src                             # RN 代码
│   ├── index.ts                    # JS 入口（对齐上游 index.js + harmony 分支）
│   └── specs/
│       └── InAppReviewModule.ts    # Harmony TurboModule Spec
├── example/                        # 鸿蒙 Example
│   ├── App.tsx
│   └── harmony/                    # 鸿蒙工程
├── index.d.ts                      # 上游公开类型声明
├── README.md                       # 中文文档
└── README_en.md                    # 英文文档
````

## 贡献代码

使用过程中发现任何问题都可以提交 [Issue](https://github.com/react-native-oh-library/react-native-in-app-review/issues)，也非常欢迎提交 [PR](https://github.com/react-native-oh-library/react-native-in-app-review/pulls)。

## 开源协议

本项目基于 [MIT License](https://github.com/MinaSamir11/react-native-in-app-review/blob/master/LICENSE)。
