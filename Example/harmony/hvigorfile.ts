import { appTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHModulePlugin } from '@rnoh/hvigor-plugin';
import * as path from 'path';

export default {
  system: appTasks, /* Built-in plugin of Hvigor. It cannot be modified. */
  plugins: [
    createRNOHModulePlugin({
      // 使用绝对路径，避免 hvigor daemon cwd 不是 harmony 目录时相对路径失效
      nodeModulesPath: path.resolve(__dirname, '../node_modules'),
      codegen: null,
      autolinking: {},
    }),
  ], /* Custom plugin to extend the functionality of Hvigor. */
}
