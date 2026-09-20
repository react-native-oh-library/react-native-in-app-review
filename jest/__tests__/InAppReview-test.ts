/**
 * react-native-in-app-review 鸿蒙适配版 JS 层白盒单元测试。
 *
 * 测试对象：src/index.ts 的 InAppReview 类。
 * 策略（rnoh-js-test 规范 模式 C）：jest.mock('react-native') 提供共享可变
 * mock（Platform / NativeModules / TurboModuleRegistry），每个用例先
 * jest.resetModules() 再重新加载被测模块，使 import 期的平台分支重新求值，
 * 从而覆盖 harmony / android / ios / 未支持平台的全部分支。
 */

type InAppReviewClass = typeof import('../../src/index').default;

/**
 * jest.mock 工厂引用的共享 mock（变量名以 mock 开头以通过 hoist 校验）。
 * 各用例改写其字段后重载被测模块，被测代码即可观察到新的平台环境。
 */
const mockReactNative: {
  Platform: {OS: string; Version: number | string};
  NativeModules: Record<string, any>;
  TurboModuleRegistry: {get: jest.Mock};
} = {
  Platform: {OS: 'harmony', Version: 20},
  NativeModules: {},
  TurboModuleRegistry: {get: jest.fn()},
};

jest.mock('react-native', () => mockReactNative);

/** 鸿蒙端新架构 TurboModule mock（InAppReviewModule Spec 的四个方法）。 */
const createTurboModule = (overrides: Record<string, unknown> = {}) => ({
  show: jest.fn().mockResolvedValue(true),
  showInAppCommentHMS: jest.fn().mockResolvedValue(true),
  isAvailable: jest.fn().mockReturnValue(true),
  openAppGalleryDetailPage: jest.fn().mockResolvedValue(true),
  ...overrides,
});

/** Android / iOS 旧架构 NativeModules mock。 */
const createLegacyNativeModules = () => ({
  InAppReviewModule: {
    show: jest.fn().mockResolvedValue(true),
    showInAppCommentHMS: jest.fn().mockResolvedValue(true),
  },
  RNInAppReviewIOS: {
    requestReview: jest.fn().mockResolvedValue('true'),
    isAvailable: true,
  },
});

/** 重置模块注册表并重新加载被测模块（import 期状态随之重建）。 */
const loadInAppReview = (): InAppReviewClass => {
  jest.resetModules();
  return require('../../src/index').default;
};

const setupHarmony = (turboModule: unknown = createTurboModule()) => {
  mockReactNative.Platform = {OS: 'harmony', Version: 20};
  mockReactNative.TurboModuleRegistry = {
    get: jest.fn().mockReturnValue(turboModule),
  };
  mockReactNative.NativeModules = createLegacyNativeModules();
  return turboModule as ReturnType<typeof createTurboModule>;
};

const setupAndroid = (nativeModules?: Record<string, any>) => {
  mockReactNative.Platform = {OS: 'android', Version: 21};
  mockReactNative.TurboModuleRegistry = {get: jest.fn().mockReturnValue(null)};
  mockReactNative.NativeModules = nativeModules ?? createLegacyNativeModules();
  return mockReactNative.NativeModules;
};

const setupIOS = (nativeModules?: Record<string, any>) => {
  mockReactNative.Platform = {OS: 'ios', Version: undefined};
  mockReactNative.TurboModuleRegistry = {get: jest.fn().mockReturnValue(null)};
  mockReactNative.NativeModules = nativeModules ?? createLegacyNativeModules();
  return mockReactNative.NativeModules;
};

describe('InAppReview · harmony', () => {
  it('RequestInAppReview 经 TurboModule.show() 拉起应用内评分弹窗', async () => {
    const turboModule = setupHarmony();
    const InAppReview = loadInAppReview();

    await expect(InAppReview.RequestInAppReview()).resolves.toBe(true);
    expect(turboModule.show).toHaveBeenCalledTimes(1);
    expect(turboModule.show).toHaveBeenCalledWith();
    // 不应触碰 Android / iOS 旧架构模块
    expect(
      mockReactNative.NativeModules.InAppReviewModule.show,
    ).not.toHaveBeenCalled();
    expect(
      mockReactNative.NativeModules.RNInAppReviewIOS.requestReview,
    ).not.toHaveBeenCalled();
  });

  it('requestInAppCommentAppGallery 经 TurboModule.showInAppCommentHMS() 拉起应用内评论', async () => {
    const turboModule = setupHarmony();
    const InAppReview = loadInAppReview();

    await expect(
      InAppReview.requestInAppCommentAppGallery(),
    ).resolves.toBe(true);
    expect(turboModule.showInAppCommentHMS).toHaveBeenCalledTimes(1);
    expect(
      mockReactNative.NativeModules.InAppReviewModule.showInAppCommentHMS,
    ).not.toHaveBeenCalled();
  });

  it('isAvailable 透传 TurboModule.isAvailable() 为 true', () => {
    const turboModule = setupHarmony();
    const InAppReview = loadInAppReview();

    expect(InAppReview.isAvailable()).toBe(true);
    expect(turboModule.isAvailable).toHaveBeenCalledTimes(1);
  });

  it('isAvailable 透传 TurboModule.isAvailable() 为 false', () => {
    setupHarmony(
      createTurboModule({isAvailable: jest.fn().mockReturnValue(false)}),
    );
    const InAppReview = loadInAppReview();

    expect(InAppReview.isAvailable()).toBe(false);
  });

  it('TurboModule 注册名固定为 InAppReviewModule', () => {
    setupHarmony();
    loadInAppReview();

    expect(mockReactNative.TurboModuleRegistry.get).toHaveBeenCalledWith(
      'InAppReviewModule',
    );
  });

  it('TurboModule 未注册时 isAvailable 返回 false（不抛错）', () => {
    setupHarmony(null);
    const InAppReview = loadInAppReview();

    expect(InAppReview.isAvailable()).toBe(false);
  });

  it('TurboModule 未注册时 RequestInAppReview 抛出链接缺失错误', () => {
    setupHarmony(null);
    const InAppReview = loadInAppReview();

    expect(() => InAppReview.RequestInAppReview()).toThrow(
      'InAppReview native module not available, did you forget to link the library?',
    );
  });

  it('TurboModule 未注册时 requestInAppCommentAppGallery 抛出链接缺失错误', () => {
    setupHarmony(null);
    const InAppReview = loadInAppReview();

    expect(() => InAppReview.requestInAppCommentAppGallery()).toThrow(
      'InAppReview native module not available, did you forget to link the library?',
    );
  });
});

describe('InAppReview · android', () => {
  it('RequestInAppReview 经 NativeModules.InAppReviewModule.show() 拉起应用内评分', async () => {
    const nativeModules = setupAndroid();
    const InAppReview = loadInAppReview();

    await expect(InAppReview.RequestInAppReview()).resolves.toBe(true);
    expect(nativeModules.InAppReviewModule.show).toHaveBeenCalledTimes(1);
    expect(
      nativeModules.RNInAppReviewIOS.requestReview,
    ).not.toHaveBeenCalled();
  });

  it('requestInAppCommentAppGallery 经 NativeModules.InAppReviewModule.showInAppCommentHMS() 拉起应用内评论', async () => {
    const nativeModules = setupAndroid();
    const InAppReview = loadInAppReview();

    await expect(
      InAppReview.requestInAppCommentAppGallery(),
    ).resolves.toBe(true);
    expect(
      nativeModules.InAppReviewModule.showInAppCommentHMS,
    ).toHaveBeenCalledTimes(1);
  });

  it('InAppReviewModule 原生模块缺失时 RequestInAppReview 抛出链接缺失错误', () => {
    setupAndroid({RNInAppReviewIOS: createLegacyNativeModules().RNInAppReviewIOS});
    const InAppReview = loadInAppReview();

    expect(() => InAppReview.RequestInAppReview()).toThrow(
      'InAppReview native module not available, did you forget to link the library?',
    );
  });

  it('InAppReviewModule 原生模块缺失时 requestInAppCommentAppGallery 抛出链接缺失错误', () => {
    setupAndroid({RNInAppReviewIOS: createLegacyNativeModules().RNInAppReviewIOS});
    const InAppReview = loadInAppReview();

    expect(() => InAppReview.requestInAppCommentAppGallery()).toThrow(
      'InAppReview native module not available, did you forget to link the library?',
    );
  });

  // Number(Platform.Version) 归一化：RNOH/部分 Android ROM 以字符串暴露版本号
  const versionCases: Array<[number | string, boolean]> = [
    [21, true],
    [32, true],
    ['32', true],
    ['33', true],
    [20, false],
    [19, false],
    ['19', false],
  ];

  it.each(versionCases)(
    'isAvailable 在 Android API %p 上返回 %p',
    (version, expected) => {
      mockReactNative.Platform = {OS: 'android', Version: version};
      mockReactNative.NativeModules = createLegacyNativeModules();
      const InAppReview = loadInAppReview();

      expect(InAppReview.isAvailable()).toBe(expected);
    },
  );
});

describe('InAppReview · ios', () => {
  it('RequestInAppReview 经 RNInAppReviewIOS.requestReview() 拉起应用内评分', async () => {
    const nativeModules = setupIOS();
    const InAppReview = loadInAppReview();

    await expect(InAppReview.RequestInAppReview()).resolves.toBe('true');
    expect(nativeModules.RNInAppReviewIOS.requestReview).toHaveBeenCalledTimes(
      1,
    );
    expect(nativeModules.InAppReviewModule.show).not.toHaveBeenCalled();
  });

  it('requestInAppCommentAppGallery 在 iOS 上返回 undefined（无 HMS 分支）', () => {
    setupIOS();
    const InAppReview = loadInAppReview();

    expect(InAppReview.requestInAppCommentAppGallery()).toBeUndefined();
    expect(
      mockReactNative.NativeModules.InAppReviewModule.showInAppCommentHMS,
    ).not.toHaveBeenCalled();
  });

  it('isAvailable 为 true 当 RNInAppReviewIOS.isAvailable 为真', () => {
    setupIOS();
    const InAppReview = loadInAppReview();

    expect(InAppReview.isAvailable()).toBe(true);
  });

  it('isAvailable 为 false 当 RNInAppReviewIOS.isAvailable 为假', () => {
    setupIOS({
      InAppReviewModule: createLegacyNativeModules().InAppReviewModule,
      RNInAppReviewIOS: {
        requestReview: jest.fn(),
        isAvailable: false,
      },
    });
    const InAppReview = loadInAppReview();

    expect(InAppReview.isAvailable()).toBe(false);
  });

  it('RNInAppReviewIOS 缺失时 RequestInAppReview 抛出链接缺失错误', () => {
    setupIOS({InAppReviewModule: createLegacyNativeModules().InAppReviewModule});
    const InAppReview = loadInAppReview();

    expect(() => InAppReview.RequestInAppReview()).toThrow(
      'InAppReview native module not available, did you forget to link the library?',
    );
  });

  it('RNInAppReviewIOS 缺失时 isAvailable 返回 false', () => {
    setupIOS({InAppReviewModule: createLegacyNativeModules().InAppReviewModule});
    const InAppReview = loadInAppReview();

    expect(InAppReview.isAvailable()).toBe(false);
  });
});

describe('InAppReview · 未支持平台（web / windows）', () => {
  const setupUnsupported = (os: string) => {
    mockReactNative.Platform = {OS: os, Version: 21};
    mockReactNative.NativeModules = createLegacyNativeModules();
    mockReactNative.TurboModuleRegistry = {
      get: jest.fn().mockReturnValue(null),
    };
  };

  it.each(['web', 'windows'])(
    '%s 上三个静态方法均不可用且不触碰原生模块',
    (os) => {
      setupUnsupported(os);
      const InAppReview = loadInAppReview();

      expect(InAppReview.RequestInAppReview()).toBeUndefined();
      expect(InAppReview.requestInAppCommentAppGallery()).toBeUndefined();
      expect(InAppReview.isAvailable()).toBe(false);
      expect(
        mockReactNative.NativeModules.InAppReviewModule.show,
      ).not.toHaveBeenCalled();
      expect(
        mockReactNative.NativeModules.RNInAppReviewIOS.requestReview,
      ).not.toHaveBeenCalled();
    },
  );
});
