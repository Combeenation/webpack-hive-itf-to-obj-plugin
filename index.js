'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const origFileExtension = '.hive.d.ts';
const globInputFiles = './src/typings/*' + origFileExtension;
const outDir = './src/typings-generated-objs';
const generatedFileExtension = '.hive.d-ti.js';
const progressMsg = 'Creating JS objects for TS interfaces...';

class CreateITFObjectPlugin {
  getLineBreakChar(str) {
    const indexOfLF = str.indexOf('\n', 1); // No need to check first-character
    if (indexOfLF === -1) {
      if (str.indexOf('\r') !== -1) return '\r';
      return '\n';
    }

    if (str[indexOfLF - 1] === '\r') return '\r\n';
    return '\n';
  }

  /**
   * Adjust the line endings of the auto-generated files if it doesn't match the source file
   */
  async adjustLineEndings() {
    const generatedFiles = fs.readdirSync(outDir);
    generatedFiles.forEach(async genFile => {
      const genFilepath = path.join(outDir, genFile);
      const srcFilepath = genFilepath
        .replace('typings-generated-objs', 'typings')
        .replace(generatedFileExtension, origFileExtension);

      const srcFileContent = await fs.promises.readFile(srcFilepath, 'utf8');
      const genFileContent = await fs.promises.readFile(genFilepath, 'utf8');
      const srcEndChar = this.getLineBreakChar(srcFileContent);
      const generatedEndChar = this.getLineBreakChar(genFileContent);

      if (srcEndChar !== generatedEndChar) {
        const regexReplace = new RegExp(generatedEndChar, 'g');
        const newContent = genFileContent.replace(regexReplace, srcEndChar);
        await fs.promises.writeFile(genFilepath, newContent);
      }
    });
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tap('CreateITFObjectPlugin', () => {
      let onlyRuntimeTypingsChanged = false;
      // different watch object when using the WatchIgnorePlugin
      const watcher = compiler.watchFileSystem.wfs || compiler.watchFileSystem;
      const changedFiles = Object.keys(watcher.watcher.mtimes);
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
        this.adjustLineEndings();
        // remove previous message with backspaces (\b)
        process.stderr.write('\b'.repeat(progressMsg.length));
      }
    });
  }
}

module.exports = CreateITFObjectPlugin;
