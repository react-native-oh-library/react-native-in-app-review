> Document Template: v0.4.2

<p align="center">
  <h1 align="center"> 
    <code>react-native-in-app-review</code>
  </h1>
</p>

This project is based on [react-native-in-app-review](https://github.com/MinaSamir11/react-native-in-app-review).

The version correspondence details are as follows:

| Name | Version (Npm Address) | Release Information | Supported RN Version | Supported Autolink | Compile API Version | Community Baseline Version | Source Code Address |
| ------------ | ------------ | ------------------------------ | ------------- | ------------- |------------------------ | ------------- | ------------- |
| @react-native-ohos/react-native-in-app-review | [~4.4.3](https://www.npmjs.com/package/@react-native-ohos/react-native-in-app-review) | [Github Releases](https://github.com/react-native-oh-library/react-native-in-app-review/releases) | 0.84.* / 0.82.* / 0.77.* / 0.72.* |  Yes | API12+ | 4.4.2 | [master](https://github.com/react-native-oh-library/react-native-in-app-review/tree/master) |

## Introduction

`react-native-in-app-review` is a **React Native native bridge library** (not a UI component library) that prompts users to submit app store ratings and reviews inside the app, without navigating to the store detail page.

| Platform | Underlying Capability |
|----------|----------------------|
| Android | Google Play In-App Review API |
| iOS | StoreKit `SKStoreReviewController` |
| Android HMS | AppGallery Intent in-app comment |
| **HarmonyOS** | AppGalleryKit `commentManager.showCommentDialog` (API 20+) |

**Design principles:**

- A successful `resolve` **does not mean** the user has rated the app (the system/API does not return rating results)
- Trigger after the user completes a core experience; avoid frequent interruptions
- On HarmonyOS, `RequestInAppReview` and `requestInAppCommentAppGallery` share the same native implementation

## Installation

Go to the project directory and execute the following instructions:

**npm**

```bash
npm install @react-native-ohos/react-native-in-app-review
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-in-app-review
```

> [!TIP] Use the original library name `'react-native-in-app-review'` in `import` statements, not the Harmony package name `@react-native-ohos/react-native-in-app-review` (mapped automatically via `harmony.alias` in RNOH projects).

## Link

| Version | Supported Autolink | Supported RN Version |
|---------|-------------------|---------------------|
| ~4.4.3 | Yes | >=0.72 |

Projects using AutoLink need to be configured according to this document. AutoLink framework guide: https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

If the version you are using supports Autolink and the project has integrated Autolink, you can skip the Manual Link configuration.

<details>
  <summary>Manual Link: This step provides guidance for manually configuring native dependencies.</summary>

Open the `harmony` directory of the OpenHarmony project in DevEco Studio.

> **Note**: This module is a TurboModule. Register the Package on both the C++ and ETS sides. **No** ArkUI custom component registration is required.

### 1. Overrides RN SDK

To ensure the project relies on the same version of the RN SDK, add an `overrides` field in the project's root `oh-package.json5` file.

For more information, refer to the [official documentation](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#en-us_topic_0000001792256137_overrides).

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.72.38"
    // "@rnoh/react-native-openharmony": "./react_native_openharmony.har"
    // "@rnoh/react-native-openharmony": "./react_native_openharmony"
  }
}
```

### 2. Introducing Native Code

Two methods are available:

- Use the HAR file (recommended)
- Directly link to the source code

**Method 1 (recommended): Use the HAR file**

> [!TIP] The HAR file is located at `harmony/in_app_review.har` in the third-party library installation path.

Open `entry/oh-package.json5` and add:

```json
"dependencies": {
  "@react-native-ohos/react-native-in-app-review": "file:../../node_modules/@react-native-ohos/react-native-in-app-review/harmony/in_app_review.har"
}
```

Click the `sync` button in the upper right corner, or run:

```bash
cd entry
ohpm install
```

**Method 2: Directly link to the source code**

> [!TIP] For details, see [Directly Linking Source Code](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/link-source-code.md).

### 3. Configuring CMakeLists and Introducing InAppReviewPackage

Open `entry/src/main/cpp/CMakeLists.txt` and add:

```cmake
set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-in-app-review/src/main/cpp" ./in_app_review)

target_link_libraries(rnoh_app PUBLIC in_app_review)
```

Open `entry/src/main/cpp/PackageProvider.cpp` and add:

```cpp
#include "InAppReviewPackage.h"

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
        std::make_shared<InAppReviewPackage>(ctx),
    };
}
```

### 4. Introducing InAppReviewPackage to ArkTS

Open `entry/src/main/ets/RNOHPackagesFactory.ets` (or `RNPackagesFactory.ets`) and add:

```typescript
import InAppReviewPackage from '@react-native-ohos/react-native-in-app-review';

export function createRNOHPackages(ctx: RNPackageContext): RNOHPackage[] {
  return [
    new InAppReviewPackage(ctx),
  ];
}
```

</details>

### Running

Click the `sync` button in the upper right corner, or run:

```bash
cd entry
ohpm install
```

Then build and run the code.

## Constraints

### Compatibility

This document is verified based on the following versions:

1. RNOH: 0.72.96; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
2. RNOH: 0.72.33; SDK: HarmonyOS NEXT B1; IDE: DevEco Studio: 5.0.3.900; ROM: Next.0.0.71;
3. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
4. RNOH: 0.82.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM:6.0.0.120 SP7;

### Permission Requirements

- No permissions required; no changes to `module.json5` needed

### API Requirements

> [!TIP] All versions of the current third-party library support version isolation, enabling compilation in `API12+` projects and execution on `API12+` ROMs.

> [!TIP] The following features depend on specific API versions. Compiling with a lower API version or running on a lower API ROM may limit functionality.

1. The in-app comment dialog depends on AppGalleryKit `commentManager.showCommentDialog`, starting from **HarmonyOS 6.0.0(20)**. Below API 20, `isAvailable()` returns `false` and calls reject with code `'21'`.
2. The internal fallback `openAppGalleryDetailPage()` depends on `productViewManager.loadProduct`, starting from **4.1.0(11)**; the `onAppear` callback starts from **5.0.2(14)**.

## Example

The following code shows the basic use scenario of the repository:

> [!WARNING] The name of the imported repository remains unchanged.

```tsx
import InAppReview from 'react-native-in-app-review';

if (InAppReview.isAvailable()) {
  InAppReview.RequestInAppReview()
    .then(result => {
      // Flow completed; HarmonyOS resolves true (boolean)
      console.log('Flow completed', result);
    })
    .catch((error: {code: string; message: string}) => {
      // code='21' when unsupported; otherwise 1021500001~1021500009
      console.log(error.code, error.message);
    });
}
```

## How to Use

**Availability check (synchronous)**

```tsx
const available = InAppReview.isAvailable();
// HarmonyOS: canIUse('SystemCapability.AppGalleryService.Distribution.Comment')
// Android: Platform.Version >= 21
// iOS: checks StoreKit class availability
```

**In-app review**

```tsx
InAppReview.RequestInAppReview()
  .then(result => console.log(result)) // HarmonyOS: true
  .catch(error => console.log(error.code, error.message));
```

**App Gallery in-app comment**

```tsx
// Same native implementation as RequestInAppReview on HarmonyOS
InAppReview.requestInAppCommentAppGallery()
  .then(result => console.log(result))
  .catch(error => console.log(error.code, error.message));
```

**Fallback path (internal API, not exposed on InAppReview class)**

```tsx
import {TurboModuleRegistry} from 'react-native';

const mod = TurboModuleRegistry.get('InAppReviewModule') as {
  openAppGalleryDetailPage(): Promise<boolean>;
} | null;

mod?.openAppGalleryDetailPage()
  .then(ok => console.log('Detail page opened', ok))
  .catch(err => console.log(err.code, err.message));
```

**HarmonyOS error codes**

| Code | Meaning |
|------|---------|
| `21` | Device/API does not support in-app comment dialog |
| `24` | `UIAbilityContext` unavailable |
| `1021500006` | Huawei account not signed in |
| `1021500007` | Current version already reviewed |
| `1021500008` | Review limit reached (max 3 per year) |
| `1021500009` | Less than one year since last review |

## Available APIs

> [!TIP] The **Platform** column indicates the platform where the API is supported in the original third-party library.

> [!TIP] If the value of **OpenHarmony Support** is **yes**, OpenHarmony supports this API; **no** means unsupported; **partially** means partial support or semantic mapping. Usage is consistent across platforms; behavior aligns with iOS or Android where applicable.

This library is a native bridge with **no UI components or Props**. Only static methods on the `InAppReview` class are exposed.

### API

| Name | Type | Parameter Type | Return Value | Required | Platform | OpenHarmony Platform Support | Description |
|------|------|---------------|--------------|----------|----------|------------------------------|-------------|
| isAvailable | function | / | boolean | No | Android, iOS | yes | Synchronously checks in-app comment capability. HarmonyOS uses `canIUse` (API 20+) |
| RequestInAppReview | function | / | Promise\<boolean\> | No | Android, iOS | partially | Launches in-app review flow. HarmonyOS maps to AppGallery `showCommentDialog`; resolves `true` on completion (does not mean user rated) |
| requestInAppCommentAppGallery | function | / | Promise\<boolean\> | No | Android (HMS) | yes | App Gallery in-app comment. Same implementation as `RequestInAppReview` on HarmonyOS; does not reproduce upstream 102/103 result codes |

### Internal API (TurboModule, not in public JS surface)

| Name | Type | Parameter Type | Return Value | Required | Platform | OpenHarmony Platform Support | Description |
|------|------|---------------|--------------|----------|----------|------------------------------|-------------|
| openAppGalleryDetailPage | function | / | Promise\<boolean\> | No | — | yes | Fallback: `productViewManager.loadProduct` opens App Gallery detail page for manual rating (API 11+) |

### Platform Differences

| Item | Upstream Behavior | HarmonyOS Behavior |
|------|------------------|-------------------|
| `RequestInAppReview` success value | Android: boolean; iOS: string `'true'` | Unified `boolean true` |
| `requestInAppCommentAppGallery` success value | Android HMS: `102`/`103` | Unified `boolean true` |
| Error codes | Google Play / HMS Intent 101~108 | Native `102150000x`; `21`/`24` aligned with upstream |
| Google Play / StoreKit | Native APIs per platform | Not supported (platform-specific) |

## Quick Verification (Running Example)

### Prerequisites

| Dependency | Version Requirement |
|------------|-------------------|
| Node.js | >= 20 |
| DevEco Studio | 5.0+ / 6.0+ |
| HarmonyOS SDK | API 12+ |

### Steps

**1. Clone the repository and install dependencies**

```bash
git clone https://github.com/react-native-oh-library/react-native-in-app-review.git
cd react-native-in-app-review
npm install
```

**2. Install example dependencies**

```bash
cd example
npm install
```

**3. Generate JS Bundle**

```bash
npm run dev
```

Output: `harmony/entry/src/main/resources/rawfile/bundle.harmony.js`

**4. Open the Harmony project in DevEco Studio**

- Open `example/harmony`
- Wait for Sync to complete
- Build and run the HAP

> **Note**: Example includes Autolink and Package registration. The in-app comment dialog requires a **real device**, **API 20+**, and a Huawei account. Emulators can only verify `isAvailable()` and error branches.

## Known Issues

- In-app comment dialog (`commentManager`) starts from 6.0.0(20). Below that version, use internal fallback `openAppGalleryDetailPage()` to open the detail page for manual rating
- Comment dialog is not supported on emulators; real-device verification depends on AGC app registration and Huawei account sign-in. Error branches (`code` + `message`) are the primary validation surface
- Official Deep Link write-review path (`store://…&action=write-review`) is not wrapped; only `loadProduct` detail-page fallback is available

## Other

None

## Directory Structure

````
react-native-in-app-review          # Project root
├── harmony                         # HarmonyOS adaptation code
│   ├── in_app_review.har           # HAR package
│   └── in_app_review               # Core Harmony adaptation
│       ├── index.ets               # Harmony entry
│       └── src/main/
│           ├── ets/
│           │   ├── InAppReviewModule.ets
│           │   └── InAppReviewTurboModulesFactory.ets
│           └── cpp/                # C++ TurboModule bridge
├── src                             # RN code
│   ├── index.ts                    # JS entry (aligned with upstream index.js + harmony branch)
│   └── specs/
│       └── InAppReviewModule.ts    # Harmony TurboModule Spec
├── example/                        # Harmony example
│   ├── App.tsx
│   └── harmony/                    # Harmony project
├── index.d.ts                      # Upstream public type declarations
├── README.md                       # Chinese document
└── README_en.md                    # English document
````

## How to Contribute

If you find any problem when using this library, submit an [Issue](https://github.com/react-native-oh-library/react-native-in-app-review/issues) or a [PR](https://github.com/react-native-oh-library/react-native-in-app-review/pulls).

## License

This project is based on the [MIT License](https://github.com/MinaSamir11/react-native-in-app-review/blob/master/LICENSE).
