const fs = require('node:fs');
const path = require('node:path');

const { withDangerousMod } = require('expo/config-plugins');

/**
 * Copies the pinned Roboto Flex file into the Android assets so the gallery and
 * the Compose reference app can use byte-identical fonts. Keep the destination
 * name identical to the Compose harness (`assets/fonts/RobotoFlex.ttf`); the
 * pixel pipeline hashes both APK entries and fails if they differ.
 */
module.exports = function withRobotoFlex(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const sourceDir = path.join(config.modRequest.projectRoot, 'assets/fonts');
      const targetDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/assets/fonts',
      );
      fs.mkdirSync(targetDir, { recursive: true });
      for (const name of ['RobotoFlex.ttf', 'OFL.txt']) {
        const source = path.join(sourceDir, name);
        if (!fs.existsSync(source)) {
          throw new Error(`missing bundled font asset: ${source}`);
        }
        fs.copyFileSync(source, path.join(targetDir, name));
      }
      return config;
    },
  ]);
};
