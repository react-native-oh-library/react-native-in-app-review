/**
 * react-native-in-app-review 鸿蒙适配版 Jest 配置。
 *
 * 对齐 RNOH JS 白盒测试规范（rnoh-js-test skill）：
 * - ts-jest 转译 TypeScript 源码（本库源码为 TS，无 Flow 剥离需求）；
 * - testMatch 同时匹配 *.test.ts 与 *-test.ts 两种命名约定；
 * - globals.__DEV__ / transformIgnorePatterns 与 RN 运行时对齐；
 * - collectCoverageFrom 聚焦 src/，npm run test:coverage 产出覆盖率报告并按阈值卡口。
 */
module.exports = {
  testEnvironment: 'node',
  // 本配置文件位于 jest/ 目录，rootDir 相对配置文件解析，
  // 上提一级指向仓库根，使 testMatch / collectCoverageFrom 等路径基于仓库根生效
  rootDir: '../',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          esModuleInterop: true,
          allowJs: true,
          strict: false,
          target: 'es2019',
          skipLibCheck: true,
          types: ['jest', 'node'],
        },
      },
    ],
  },
  testMatch: [
    '<rootDir>/jest/**/*.test.ts',
    '<rootDir>/jest/**/*-test.ts',
    '<rootDir>/src/**/__tests__/*.test.ts',
    '<rootDir>/src/**/__tests__/*-test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/example/',
    '<rootDir>/dist/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest/jest.setup.js'],
  globals: {
    __DEV__: true,
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|react)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      // 实测上限:语句/行/函数 100%,分支 94.73%
      // (src/index.ts 中 InAppReviewModule?.show() / ?.showInAppCommentHMS()
      //  的可选链空值路径为防御性死分支,isModuleAvailable() 已保证非空,不可达)
      branches: 94,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
