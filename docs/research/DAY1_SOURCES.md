# Day 1 sources, pins, and evidence

**Date:** 2026-11-25
**Purpose:** record every version, URL, hash, and tool decision used to bootstrap the workspace. Day 0 research remains in `DAY0_SOURCES.md`; this file supersedes only the runtime pins it names.

---

## 1. Toolchain installed

| Tool | Version | Evidence |
|---|---|---|
| Node.js | `24.22.3` | `node --version` |
| Corepack | `0.36.0` | `corepack --version` |
| pnpm | `12.23.0` | `corepack prepare pnpm@12.23.0 --activate && pnpm --version`; pinned by root `packageManager` |
| Git | `2.50.1` | `git --version` |
| gh | `2.105.0` | `gh --version` (not authenticated; git credential used for the push) |
| Xcode | `26.5` (17F42) | `xcodebuild -version` |
| JDK | `17.0.20.1` | `java -version` |
| Android SDK | API 31 AVD `Android12_API31` | `emulator -list-avds`; booted and verified |
| CocoaPods | not installed | `pod --version` exits 127; not needed for the Expo Go boot path |

No global npm packages were installed. pnpm is activated through Corepack.

## 2. JavaScript dependency pins

### Root / tooling

| Package | Pin | Note |
|---|---|---|
| `turbo` | `2.11.13` | task graph |
| `typescript` | `6.0.3` | Expo SDK 58 template pin; `typescript-eslint@8.74.0` peers `<6.1.0`, so TS 7.0.2 is deliberately not used |
| `eslint` | `9.39.5` | ESLint 10 exists but `eslint-config-expo@58.0.4` and the flat config ecosystem are validated on 9.x |
| `@eslint/js` | `9.39.5` | must match ESLint |
| `typescript-eslint` | `8.74.0` | peer `eslint ^8.57 || ^9 || ^10`, `typescript <6.1` |
| `eslint-config-prettier` | `10.1.8` | |
| `eslint-plugin-react-hooks` | `7.1.1` | |
| `globals` | `17.14.0` | |
| `prettier` | `3.10.1` | |
| `@changesets/cli` | `3.0.3` | |
| `react-native-builder-bob` | `0.44.1` | ESM + CJS + declarations |
| `jest` | `30.5.2` | |
| `jest-expo` | `58.0.15` | peer `jest ^29 || ^30` |
| `@testing-library/react-native` | `14.1.0` | peer `react >=19`, `test-renderer ^1.0.0` |
| `@types/jest` | `30.0.0` | |
| `@types/react` | `19.3.2` | |

### Gallery (Expo SDK 58.0.26)

Resolved from `expo@58.0.26/bundledNativeModules.json` plus the SDK 58 template:

| Package | Pin |
|---|---|
| `expo` | `58.0.26` |
| `react` | `19.3.0` |
| `react-dom` | `19.3.0` |
| `react-native` | `0.88.1` |
| `react-native-reanimated` | `4.7.1` |
| `react-native-worklets` | `0.13.0` |
| `react-native-safe-area-context` | `5.11.1` |
| `react-native-web` | `0.21.4` |
| `@expo/metro-runtime` | `58.0.17` |
| `expo-status-bar` | `58.0.5` |
| `babel-preset-expo` | `58.0.26` |

Not installed yet, deliberately:

| Package | SDK 58 pair | Installed on |
|---|---|---|
| `react-native-gesture-handler` | `3.3.0` | Day 7, if ADR-002 chooses it for gestures |
| `react-native-svg` | `15.16.0` | Day 7, if ADR-002 chooses SVG over Skia |
| `react-native-skia` | `3.13.0` (latest standalone) | Day 7 spike only |

`pnpm-workspace.yaml` overrides `react`, `react-dom`, `react-native`, `react-native-reanimated`, and `react-native-worklets` to these exact versions so a transitive dependency cannot introduce a second copy.

**Why these and not the newest:** Expo SDK 58.0.26 is the latest patch and pins RN 0.88.1. Reanimated 4.8.0 / Worklets 0.14.0 exist but are not the Expo-blessed pair; ADR-003 defers that upgrade to Day 7 with a compatibility job. TypeScript 7.0.2 exists but is outside the `typescript-eslint` peer range.

## 3. GitHub Actions pins

Checked against the GitHub Releases API on 2026-11-25:

| Action | Tag | Latest release |
|---|---|---|
| `actions/checkout` | `v7` | `v7.0.1` (2026-07-20) |
| `actions/setup-node` | `v7` | `v7.1.0` (2026-10-08) |
| `pnpm/action-setup` | `v6` | `v6.1.1` (2026-11-03) |

CI runs Node 24, pnpm 12.23.0, `pnpm install --frozen-lockfile`, `format:check`, `lint`, `typecheck`, `test`, `build`.

**First green run:** workflow `CI`, run `45622269300`, `success`, 38s, all 10 steps green (install through build). URL: `https://github.com/nasyx-rakeeb/react-native-material-expressive/actions/runs/45622269300`.

## 4. Clean-clone verification

Clone: `https://github.com/nasyx-rakeeb/react-native-material-expressive.git` at `66e81c4`, into a fresh temporary directory.

```
pnpm install --frozen-lockfile   -> Done in 4.4s, 936 reused
pnpm build                       -> 1 task successful, 8.381s
pnpm test                        -> 1 suite / 8 tests passed
```

This is the Day 1 exit evidence for the install/build/test leg.

## 5. iOS simulator runtime

Xcode 26.5 shipped with **no installed simulator runtime** (`xcrun simctl list runtimes` empty). `xcodebuild -downloadPlatform iOS` sat at “Preparing to download…” for >25 minutes with an established TCP connection and no bytes written. The host is an Intel MacBook Pro (`MacBookPro16,1`, x86_64), so the arm64-only asset is not usable.

The public downloadable index is:

- `https://devimages-cdn.apple.com/downloads/xcode/simulators/index2.dvtdownloadableindex`

It lists the iOS 26.5 runtime as `downloadMethod: mobileAsset` (no direct `source`). The local MobileAsset catalog at `/System/Library/AssetsV2/com_apple_MobileAsset_iOSSimulatorRuntime/` exposes the direct asset:

| Field | Value |
|---|---|
| Version / build | iOS **26.5** / `23F77` |
| Architectures | `arm64`, `x86_64` (universal) |
| Download size | **10,603,200,512** bytes |
| Archive | AppleArchive (`.aar`), encrypted |
| URL | `https://updates.cdn-apple.com/2026MobileAssets/mobileassets/141-17391/861AC1A1-34F1-45F2-8627-8DA3F4817EB6/com_apple_MobileAsset_iOSSimulatorRuntime/431E7919-2417-4011-9D5C-977EBA3ECBA5.aar` |
| SHA-256 | `a40a878dddc82074a0afd9a73bee7d134b1b5742895e2e29cdbfb63f427f79a0` |
| Decryption key (catalog) | `5jF5x1y5fsGpyGZkXcLyQ4UybwUtGkrKhtPQ0LFGkTY=` |

The arm64-only variant is `a0872c9d…f840b` and is **not** used.

**Install path that worked.** The `.aar` is not a plain file archive; it is a MobileAsset *asset* archive whose entries are `YOP=manifest` / `YOP=extract` / `YOP=dst-fixup` records. `aa extract` therefore reports four entries and extracts zero files. The asset extractor is the undocumented `aa patch` subcommand:

```sh
# 1. copy the 32-byte key into a raw file (the base64 text is not accepted by aea)
python3 - <<'PY'
import base64, pathlib
key = base64.b64decode('5jF5x1y5fsGpyGZkXcLyQ4UybwUtGkrKhtPQ0LFGkTY=')
pathlib.Path('key.bin').write_bytes(key)
PY

# 2. extract the asset archive (decrypts and reconstructs the file tree)
aa patch -i ios-26.5-universal.aar -dst runtime -key key.bin

# 3. install the extracted cryptex disk image
xcrun simctl runtime add runtime/AssetData/Restore/iOSSimulatorRuntime_Cryptex.dmg
```

`aa patch` reported `patch type: full replacement` and produced:

```
runtime/AssetData/Restore/iOSSimulatorRuntime_Cryptex.dmg            9.9G
runtime/AssetData/Restore/Firmware/iOSSimulatorRuntime_Cryptex.dmg.cryptex_info
runtime/AssetData/Restore/Firmware/iOSSimulatorRuntime_Cryptex.dmg.root_hash
runtime/AssetData/Restore/Firmware/iOSSimulatorRuntime_Cryptex.dmg.trustcache
runtime/AssetData/Restore/Restore.plist
runtime/AssetData/Restore/BuildManifest.plist
runtime/Info.plist
runtime/version.plist
```

The installed runtime is `iOS 26.5 (26.5 - 23F77)`, UUID `2CC3C223-685E-412A-9B0E-CB057A0F6512`, signature `Verified`, architectures `x86_64` + `arm64`.

**Boot evidence.** Xcode created an `iPhone 17 Pro` device (`D826ADD7-BFFA-4677-B89B-B2E0060AE4C2`) on first launch. First boot took **11m27s** because CoreSimulator had to build the dyld shared cache for the new runtime; subsequent boots are normal. Expo Go **58.0.7** was installed by Expo CLI, and the gallery bundle loaded (`iOS Bundled 15489ms apps/gallery/index.js (724 modules)`). Screenshot: `docs/evidence/day1/gallery-ios.png`.

The raw asset, decrypted archive, and extracted tree are git-ignored (they live outside the repo, under `~/Library/Caches/m3e-ios-runtime/`).

## 6. Competitor teardown evidence

Published tarballs inspected from npm on 2026-11-25:

| Package | Version | SHA-256 of tarball |
|---|---|---|
| `@expressive-ui/core` | `0.3.0` | `f94c17838ad2d9d658f9b3b9ed1cb3f7447d83efd7af659a637d3e74a523f2e5` |
| `@expressive-ui/schema` | `0.3.0` | `086878baf157083b99ddd33902c05378477c0ac9f8f7ab4c42e537e8f09df021` |
| `@expressive-ui/tokens` | `0.3.0` | `e2584ef2ce3ee34c1f97ae3bbd40d6dab678f4de26c69da4585375806a8d4c02` |
| `@expressive-ui/native` | `0.3.0` | registry integrity `sha512-8Dx5cMz0um7y09bh30Jtr326x6SOibVVCJEx0ChJZc9Oo1AJLt2msSvFtwSgz24tqtBQU5Oaou89MlQ6QJvTcw==` |

Registry facts verified: first publish `2026-10-28`, six releases, `0.3.0` on `2026-11-24`, 172 downloads in the week ending 2026-11-24, maintainer `cunhamurilo`, no `repository` field. Source findings and positioning are in `docs/COMPETITOR_MATRIX.md` §3.1. Raw tarballs are git-ignored.

## 7. Limits

- The iOS boot evidence is pending the runtime install at the time of writing; `PROGRESS.md` records the final state.
- `xcodebuild -downloadPlatform` failure is an environment/tooling issue, not a project defect. The workaround is documented so CI or another machine can reproduce it.
- Android was booted on API 31 x86_64 with software GPU (`swiftshader_indirect`), not on a physical device. Performance numbers from this emulator are not release evidence.
