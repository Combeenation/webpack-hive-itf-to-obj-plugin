'use strict';

const cp = require('child_process');
const fs = require('fs');

const globInputFiles = './src/typings/*.hive.d.ts';
const outDir = './src/typings-generated-objs';
const generatedFileExtension = '.hive.d-ti.js';
const progressMsg = 'Creating JS objects for TS interfaces...';

class CreateITFObjectPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tap('CreateITFObjectPlugin', () => {
      let onlyRuntimeTypingsChanged = false;
      const changedFiles = Object.keys(compiler.watchFileSystem.watcher.mtimes);
      if (changedFiles.length > 0) {
        // Mainly required because it's detected as change, even though the watcher should ignore it
        onlyRuntimeTypingsChanged = changedFiles.every(filepath => filepath.indexOf(generatedFileExtension) > -1);
      }

      if (!onlyRuntimeTypingsChanged) {
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
          process.stderr.write('Created directory: ' + outDir + '\n');
        }

        process.stderr.write(progressMsg);
        cp.execSync(`ts-interface-builder --format=js:esm --changed-only --outDir ${outDir} ${globInputFiles}`);
        // remove previous message with backspaces (\b)
        process.stderr.write('\b'.repeat(progressMsg.length));
      }
    });
  }
}

module.exports = CreateITFObjectPlugin;
