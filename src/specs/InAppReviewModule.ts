/**
 * react-native-in-app-review HarmonyOS TurboModule Spec（v1）。
 *
 * 原库为旧架构（index.js 经 NativeModules 解构 {InAppReviewModule, RNInAppReviewIOS}），
 * 本文件手写转换为新架构 TurboModule Spec。
 *
 * 模块名 'InAppReviewModule' 沿用 Android 原生模块名；本文件名、
 * TurboModuleRegistry.get 参数、ArkTS 侧 TM 命名空间/注册名四处必须完全一致。
 */
import {TurboModuleRegistry} from 'react-native';
import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';

export interface Spec extends TurboModule {
  /**
   * 拉起应用内评分弹窗（对齐 Android InAppReviewModule.show()）。
   * HarmonyOS 实现：@kit.AppGalleryKit commentManager.showCommentDialog（API 20+）。
   * 弹窗流程完成 resolve(true)；失败 reject({code, message})，
   * code 为字符串：设备不支持为 '21'（对齐原库 ERROR_DEVICE_VERSION），
   * 其余为鸿蒙应用评论服务错误码 1021500001~1021500009 原样透传。
   */
  show(): Promise<boolean>;
  /**
   * 华为应用市场应用内评论（对齐 Android InAppReviewModule.showInAppCommentHMS()）。
   * HarmonyOS 上应用市场即 AppGallery，原 Google Play / HMS 双路径在此合流为同一实现，
   * resolve(true)（鸿蒙 Promise<void> 无结果码，原库 Android 端 resolve(102/103) 的差异见 README）。
   */
  showInAppCommentHMS(): Promise<boolean>;
  /**
   * 当前设备是否具备应用内评论弹窗能力（同步方法）。
   * 实现：canIUse('SystemCapability.AppGalleryService.Distribution.Comment')。
   */
  isAvailable(): boolean;
  /**
   * 降级路径（内部能力，不进入 InAppReview JS 类公开面）：
   * productViewManager.loadProduct 拉起应用市场应用详情页（API 11+），供低版本设备手动评分。
   * 详情页成功打开 resolve(true)，失败 reject({code, message})。
   */
  openAppGalleryDetailPage(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('InAppReviewModule')!;
