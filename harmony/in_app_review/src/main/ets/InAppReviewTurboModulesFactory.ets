/**
 * react-native-in-app-review RNPackage（TurboModule 注册）。
 *
 * 注册名 TM.InAppReviewModule.NAME === 'InAppReviewModule'，
 * 与 JS 侧 TurboModuleRegistry.get('InAppReviewModule') 完全一致。
 * 本类经 index.ets default 导出，由 hvigor autolinking 汇入 example 的
 * RNOHPackagesFactory（返回非空数组，空数组 = 运行时白屏）。
 */
import {RNOHPackage} from '@rnoh/react-native-openharmony/ets';
import {UITurboModule, UITurboModuleContext} from '@rnoh/react-native-openharmony/ts';
import {InAppReviewModule} from './InAppReviewModule';
import {TM} from './generated/ts';

export class InAppReviewPackage extends RNOHPackage {
  getUITurboModuleFactoryByNameMap():
    Map<string, (ctx: UITurboModuleContext) => UITurboModule | null> {
    const map =
      new Map<string, (ctx: UITurboModuleContext) => UITurboModule | null>();
    map.set(
      TM.InAppReviewModule.NAME,
      (ctx: UITurboModuleContext) => new InAppReviewModule(ctx),
    );
    return map;
  }

  override async createEagerUITurboModuleByNameMap(
    ctx: UITurboModuleContext,
  ): Promise<Map<string, UITurboModule>> {
    const module = new InAppReviewModule(ctx);
    return new Map<string, UITurboModule>().set(
      TM.InAppReviewModule.NAME,
      module,
    );
  }
}
