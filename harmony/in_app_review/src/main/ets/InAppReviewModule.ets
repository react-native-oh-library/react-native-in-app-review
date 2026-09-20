/**
 * react-native-in-app-review HarmonyOS TurboModule 实现。
 *
 * 主路径：@kit.AppGalleryKit commentManager.showCommentDialog（起始 6.0.0(20)），
 *   应用内拉起应用市场评论弹窗，用户无需进入详情页即可评分评论。
 * 降级路径：productViewManager.loadProduct（起始 4.1.0(11)）拉起应用市场应用详情页，
 *   供低版本设备手动评分（内部能力，不进入 InAppReview JS 公开面）。
 *
 * 契约：成功 resolve(true)（boolean，对齐 index.d.ts 的 Promise<boolean>，
 * 不沿用 iOS 端 resolve('true') 字符串）；失败 reject({code, message})，
 * code 为字符串（设备不支持为 '21'，其余为鸿蒙错误码 1021500001~1021500009 透传）。
 */
import {commentManager, productViewManager} from '@kit.AppGalleryKit';
import {BusinessError, deviceInfo} from '@kit.BasicServicesKit';
import {Want} from '@kit.AbilityKit';
import {UITurboModule, UITurboModuleContext} from '@rnoh/react-native-openharmony/ts';
import {TM} from './generated/ts';

/** 应用内评论弹窗系统能力（commentManager.showCommentDialog 要求 API 20+） */
const SYSCAP_IN_APP_COMMENT = 'SystemCapability.AppGalleryService.Distribution.Comment';

/** reject 跨桥错误形状：code 为字符串（对齐原库 reject('21', …) 风格），message 保留原文 */
interface InAppReviewError {
  code: string;
  message: string;
}

export class InAppReviewModule extends UITurboModule
  implements TM.InAppReviewModule.Spec {
  public static readonly NAME = TM.InAppReviewModule.NAME;

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
  }

  /** 设备是否具备应用内评论弹窗能力（同步，供 JS isAvailable() 使用） */
  isAvailable(): boolean {
    return canIUse(SYSCAP_IN_APP_COMMENT);
  }

  /** 拉起应用内评分弹窗（对齐 Android InAppReviewModule.show()） */
  show(): Promise<boolean> {
    return this.showCommentDialog('show');
  }

  /**
   * 华为应用市场应用内评论。鸿蒙上应用市场即 AppGallery，
   * 原 Google Play / HMS 双路径在此合流，与 show() 同一实现。
   */
  showInAppCommentHMS(): Promise<boolean> {
    return this.showCommentDialog('showInAppCommentHMS');
  }

  /**
   * 降级路径：productViewManager.loadProduct 拉起本应用的应用市场详情页。
   * 详情页成功打开（onAppear，API 14+）resolve(true)；API 11~13 无 onAppear 回调，
   * 同步调用未抛出即 resolve(true)；失败（onError 1011/1012/1013 或同步抛出）
   * reject({code, message})。
   */
  openAppGalleryDetailPage(): Promise<boolean> {
    const api = 'openAppGalleryDetailPage';
    return new Promise<boolean>((resolve, reject) => {
      // 调用时即时读 getter（不缓存，避免拿到未就绪/失效的上下文快照）
      const context = this.ctx.uiAbilityContext;
      if (!context) {
        const err: InAppReviewError = {
          code: '24',
          message: "ACTIVITY_DOESN'T_EXIST: UIAbilityContext is not available",
        };
        reject(err);
        return;
      }
      const bundleName = context.abilityInfo.bundleName;
      if (!bundleName) {
        const err: InAppReviewError = {
          code: '24',
          message: "ACTIVITY_DOESN'T_EXIST: failed to resolve current bundleName",
        };
        reject(err);
        return;
      }
      try {
        const want: Want = {
          parameters: {
            'bundleName': bundleName,
          },
        };
        productViewManager.loadProduct(context, want, {
          onError: (error: BusinessError) => {
            this.ctx.logger.error(
              `${api} loadProduct onError: code=${error.code}, message=${error.message}`);
            const err: InAppReviewError = {
              code: `${error.code}`,
              message: error.message,
            };
            reject(err);
          },
          onAppear: () => {
            this.ctx.logger.info(`${api} loadProduct onAppear`);
            resolve(true);
          },
          onDisappear: () => {
            this.ctx.logger.info(`${api} loadProduct onDisappear`);
          },
        });
        // onAppear/onDisappear 回调起始 5.0.2(14)：更低版本设备没有"详情页已打开"信号，
        // 若只等 onAppear 则 Promise 永悬。低版本上同步调用未抛出即视为已发起并 resolve
        //（异步失败仍由 API 11 起可用的 onError reject 兜底，resolve 后 reject 为 no-op）。
        if (deviceInfo.sdkApiVersion < 14) {
          this.ctx.logger.info(
            `${api} loadProduct launched (sdkApiVersion=${deviceInfo.sdkApiVersion} < 14, no onAppear callback)`);
          resolve(true);
        }
      } catch (error) {
        const e: BusinessError = error as BusinessError;
        this.ctx.logger.error(`${api} loadProduct throw: code=${e.code}, message=${e.message}`);
        const err: InAppReviewError = {
          code: `${e.code}`,
          message: e.message,
        };
        reject(err);
      }
    });
  }

  /** show/showInAppCommentHMS 共用主路径：commentManager.showCommentDialog */
  private showCommentDialog(api: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (!canIUse(SYSCAP_IN_APP_COMMENT)) {
        // 对齐原库语义：设备/系统版本不支持时 reject '21'（ERROR_DEVICE_VERSION）
        this.ctx.logger.error(`${api} syscap not supported: ${SYSCAP_IN_APP_COMMENT}`);
        const err: InAppReviewError = {
          code: '21',
          message: 'ERROR_DEVICE_VERSION: this device does not support the in-app ' +
            'comment dialog (requires HarmonyOS 6.0.0(API 20)+ with ' +
            'SystemCapability.AppGalleryService.Distribution.Comment)',
        };
        reject(err);
        return;
      }
      // 调用时即时读 getter：TurboModule 可能早于上下文就绪被急切实例化，
      // 构造时缓存会拿到失效上下文（错误码 1021500005）
      const context = this.ctx.uiAbilityContext;
      if (!context) {
        const err: InAppReviewError = {
          code: '24',
          message: "ACTIVITY_DOESN'T_EXIST: UIAbilityContext is not available",
        };
        reject(err);
        return;
      }
      try {
        commentManager
          .showCommentDialog(context)
          .then(() => {
            // 弹窗流程完成（用户提交/关闭）。API 不指示用户是否真的评论，
            // 与原库 Android launchReviewFlow 完成后 resolve 的语义一致。
            this.ctx.logger.info(`${api} showCommentDialog resolved`);
            resolve(true);
          })
          .catch((error: BusinessError) => {
            // 鸿蒙错误码 1021500001~1021500009 原样透传（code 字符串化）
            this.ctx.logger.error(
              `${api} showCommentDialog failed: code=${error.code}, message=${error.message}`);
            const err: InAppReviewError = {
              code: `${error.code}`,
              message: error.message,
            };
            reject(err);
          });
      } catch (error) {
        const e: BusinessError = error as BusinessError;
        this.ctx.logger.error(
          `${api} showCommentDialog throw: code=${e.code}, message=${e.message}`);
        const err: InAppReviewError = {
          code: `${e.code}`,
          message: e.message,
        };
        reject(err);
      }
    });
  }
}
