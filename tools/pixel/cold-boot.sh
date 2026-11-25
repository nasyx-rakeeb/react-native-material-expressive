#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
AVD="${M3E_AVD:-M3E_API31}"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
EMULATOR="$SDK/emulator/emulator"
LOG="${M3E_EMULATOR_LOG:-/tmp/m3e-emulator.log}"

if [ ! -x "$EMULATOR" ]; then
  echo "emulator not found at $EMULATOR" >&2
  exit 1
fi

echo "cold boot: stopping any running emulator"
adb emu kill >/dev/null 2>&1 || true
for _ in $(seq 1 30); do
  if ! adb devices | grep -q '^emulator-'; then
    break
  fi
  sleep 1
done

echo "cold boot: starting $AVD with -no-snapshot -gpu swiftshader_indirect"
nohup "$EMULATOR" \
  -avd "$AVD" \
  -no-window \
  -gpu swiftshader_indirect \
  -no-snapshot \
  -no-boot-anim \
  -no-audio \
  -port 5554 \
  >"$LOG" 2>&1 &

adb wait-for-device
for _ in $(seq 1 180); do
  if [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; then
    break
  fi
  sleep 2
done

if [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; then
  echo "emulator did not finish booting; see $LOG" >&2
  exit 1
fi

bash "$ROOT/tools/pixel/freeze-profile.sh"
echo "cold boot complete: $(adb shell getprop ro.build.version.sdk | tr -d '\r') / $(adb shell wm density | tr -d '\r')"
