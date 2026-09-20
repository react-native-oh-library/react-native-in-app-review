/**
 * react-native-in-app-review 鸿蒙适配版 JS 入口。
 *
 * 结构与原库 index.js 保持一致（default export class InAppReview，
 * RequestInAppReview / requestInAppCommentAppGallery / isAvailable 三个静态方法），
 * 新增显式 OS === 'harmony' 分支（禁止排除法平台判断）：
 * 鸿蒙端经 TurboModuleRegistry.get('InAppReviewModule') 解析新架构 TurboModule。
 */
import {NativeModules, Platform, TurboModuleRegistry} from 'react-native';
import type {Spec} from './specs/InAppReviewModule';

/**
 * react-native 0.72 的类型定义中 Platform.OS 联合不含 'harmony'，
 * 但 RNOH 运行时（metro 映射到 @react-native-oh/react-native-harmony 后）
 * 实际取值为 'harmony'，故放宽为 string 比较。
 */
const OS: string = Platform.OS;

const {InAppReviewModule: InAppReviewModuleAndroid, RNInAppReviewIOS} =
  NativeModules;

// 鸿蒙端走新架构 TurboModule（模块名与 Android 原生模块名一致）
const InAppReviewModule = TurboModuleRegistry.get<Spec>('InAppReviewModule');

const isAvailableIOS = !!RNInAppReviewIOS && RNInAppReviewIOS.isAvailable; //ios version check

function isModuleAvailable() {
  if (OS === 'harmony') {
    if (!InAppReviewModule) {
      throw new Error(
        'InAppReview native module not available, did you forget to link the library?',
      );
    }
    return true;
  } else if (OS === 'android') {
    if (!InAppReviewModuleAndroid) {
      throw new Error(
        'InAppReview native module not available, did you forget to link the library?',
      );
    }
    return true;
  } else if (OS === 'ios') {
    if (!RNInAppReviewIOS) {
      throw new Error(
        'InAppReview native module not available, did you forget to link the library?',
      );
    }
    return true;
  } else {
    return false;
  }
}

export default class InAppReview {
  static RequestInAppReview(): Promise<boolean> | undefined {
    if (isModuleAvailable()) {
      if (OS === 'harmony') {
        return InAppReviewModule?.show();
      } else if (OS === 'android') {
        return InAppReviewModuleAndroid.show();
      } else {
        return RNInAppReviewIOS.requestReview();
      }
    }
    return undefined;
  }

  static requestInAppCommentAppGallery(): Promise<boolean> | undefined {
    if (isModuleAvailable()) {
      if (OS === 'harmony') {
        return InAppReviewModule?.showInAppCommentHMS();
      } else if (OS === 'android') {
        return InAppReviewModuleAndroid.showInAppCommentHMS();
      }
    }
    return undefined;
  }

  static isAvailable(): boolean {
    if (OS === 'harmony') {
      return !!InAppReviewModule && InAppReviewModule.isAvailable();
    } else if (OS === 'android' && Number(Platform.Version) >= 21) {
      return true;
    } else if (OS === 'ios') {
      return isAvailableIOS;
    } else {
      return false;
    }
  }
}
