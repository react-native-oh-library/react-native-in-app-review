/**
 * react-native-in-app-review 鸿蒙适配版 TurboModule Spec 冒烟测试。
 *
 * 测试对象：src/specs/InAppReviewModule.ts。
 * codegen spec 无业务逻辑（rnoh-js-test 规范：只验接口解析行为），
 * 验证默认导出经 TurboModuleRegistry.get('InAppReviewModule') 解析，
 * 且模块未注册时如实透传 null（`!` 非空断言不产生运行时行为）。
 */

const mockReactNative: {
  TurboModuleRegistry: {get: jest.Mock};
} = {
  TurboModuleRegistry: {get: jest.fn()},
};

jest.mock('react-native', () => mockReactNative);

it('默认导出经 TurboModuleRegistry.get 解析 InAppReviewModule', () => {
  const turboModule = {
    show: jest.fn(),
    showInAppCommentHMS: jest.fn(),
    isAvailable: jest.fn(),
    openAppGalleryDetailPage: jest.fn(),
  };
  mockReactNative.TurboModuleRegistry.get = jest
    .fn()
    .mockReturnValue(turboModule);

  jest.resetModules();
  const spec = require('../../src/specs/InAppReviewModule').default;

  expect(spec).toBe(turboModule);
  expect(mockReactNative.TurboModuleRegistry.get).toHaveBeenCalledWith(
    'InAppReviewModule',
  );
});

it('TurboModule 未注册时默认导出为 null', () => {
  mockReactNative.TurboModuleRegistry.get = jest.fn().mockReturnValue(null);

  jest.resetModules();
  const spec = require('../../src/specs/InAppReviewModule').default;

  expect(spec).toBeNull();
});
