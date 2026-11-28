#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

node tools/scenes/build.mjs

if [ ! -d apps/gallery/android ] || [ "${1:-}" = "--clean" ]; then
  (cd apps/gallery && CI=1 npx expo prebuild -p android --clean --no-install)
fi

(cd apps/gallery/android && ./gradlew :app:createBundleReleaseJsAndAssets --rerun-tasks)
(cd apps/gallery/android && ./gradlew :app:assembleRelease)
(cd apps/reference-compose && ./gradlew :app:assembleDebug)

node --input-type=module -e "
import { verifyFonts } from './tools/pixel/lib.mjs';
const result = verifyFonts();
for (const [name, font] of Object.entries(result)) {
  console.log(name, 'source ', font.sourceHash);
  console.log(name, 'compose', font.apks.compose);
  console.log(name, 'rn     ', font.apks.rn);
}
"

adb install -r apps/reference-compose/app/build/outputs/apk/debug/app-debug.apk
adb install -r apps/gallery/android/app/build/outputs/apk/release/app-release.apk
