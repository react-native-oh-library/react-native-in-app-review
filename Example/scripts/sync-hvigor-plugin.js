/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

const fs = require('fs');
const path = require('path');

const exampleDir = path.join(__dirname, '..');
const cliDir = path.join(
  exampleDir,
  'node_modules',
  '@react-native-oh',
  'react-native-harmony-cli',
);
const cliHarmonyDir = path.join(cliDir, 'harmony');
const hvigorDir = path.join(exampleDir, 'harmony', 'hvigor');
const hvigorConfigPath = path.join(hvigorDir, 'hvigor-config.json5');

let cliVersion;
try {
  cliVersion = require(path.join(cliDir, 'package.json')).version;
} catch (e) {
  console.warn(
    '[sync-hvigor-plugin] @react-native-oh/react-native-harmony-cli is not installed, skip. Run "npm i" first.',
  );
  process.exit(0);
}

if (!fs.existsSync(cliHarmonyDir)) {
  console.warn(
    `[sync-hvigor-plugin] ${cliHarmonyDir} not found, skip.`,
  );
  process.exit(0);
}

const candidates = fs
  .readdirSync(cliHarmonyDir)
  .filter((name) => /^rnoh-hvigor-plugin-.*\.tgz$/.test(name));

let tgzName = candidates.find(
  (name) => name === `rnoh-hvigor-plugin-${cliVersion}.tgz`,
);
if (!tgzName) {
  const baseVersion = cliVersion.split('-')[0];
  tgzName = candidates.find(
    (name) => name === `rnoh-hvigor-plugin-${baseVersion}.tgz`,
  );
}
if (!tgzName && candidates.length === 1) {
  tgzName = candidates[0];
}
if (!tgzName) {
  console.warn(
    `[sync-hvigor-plugin] No rnoh-hvigor-plugin tgz for cli@${cliVersion} in ${cliHarmonyDir}, skip.`,
  );
  process.exit(0);
}

if (!fs.existsSync(hvigorDir)) {
  fs.mkdirSync(hvigorDir, {recursive: true});
}

const srcTgz = path.join(cliHarmonyDir, tgzName);
const destTgz = path.join(hvigorDir, tgzName);
fs.copyFileSync(srcTgz, destTgz);

for (const name of fs.readdirSync(hvigorDir)) {
  if (/^rnoh-hvigor-plugin-.*\.tgz$/.test(name) && name !== tgzName) {
    fs.unlinkSync(path.join(hvigorDir, name));
  }
}

// Short file:./ path — hvigor resolves from harmony/hvigor/
const spec = `file:./${tgzName}`;
const content = fs.readFileSync(hvigorConfigPath, 'utf-8');
if (content.includes(spec)) {
  console.log(
    `[sync-hvigor-plugin] Already up to date: @rnoh/hvigor-plugin -> ${tgzName} (cli ${cliVersion})`,
  );
  process.exit(0);
}

const depRe = /(["'])@rnoh\/hvigor-plugin\1\s*:\s*(["'])[^"']*\2/;
let next;
if (depRe.test(content)) {
  next = content.replace(depRe, (m, q1, q2) =>
    `${q1}@rnoh/hvigor-plugin${q1}: ${q2}${spec}${q2}`,
  );
} else {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  if (/"dependencies"\s*:\s*\{\s*\}/.test(content)) {
    next = content.replace(
      /"dependencies"\s*:\s*\{\s*\}/,
      `"dependencies": {${eol}    "@rnoh/hvigor-plugin": "${spec}"${eol}  }`,
    );
  } else {
    next = content.replace(
      /"dependencies"\s*:\s*\{/,
      `"dependencies": {${eol}    "@rnoh/hvigor-plugin": "${spec}",`,
    );
  }
}

if (next === content) {
  console.error(
    `[sync-hvigor-plugin] Failed to update ${hvigorConfigPath}. Set "@rnoh/hvigor-plugin" to "${spec}" manually.`,
  );
  process.exit(1);
}

fs.writeFileSync(hvigorConfigPath, next);
console.log(
  `[sync-hvigor-plugin] Updated @rnoh/hvigor-plugin -> ${tgzName} (cli ${cliVersion}) in harmony/hvigor/hvigor-config.json5`,
);
