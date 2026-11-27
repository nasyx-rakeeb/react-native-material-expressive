#!/usr/bin/env bash
# U-29 physical-device capture for the Day 7 renderer spike.
#
# Installs the arm64 release APK through root (MIUI blocks plain `adb install`),
# runs all six spike modes, and prints the last frame-stats line for each run.
# It does not decide U-29: a human still records the device model, SoC and
# refresh rate from the on-screen card.
#
# Usage:
#   tools/device/u29-capture.sh                # first non-emulator device
#   SERIAL=<serial> tools/device/u29-capture.sh
#   SKIP_INSTALL=1 tools/device/u29-capture.sh # app already installed
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APK="${APK:-$ROOT/apps/gallery/android/app/build/outputs/apk/release/app-release.apk}"
PKG="com.nasyxrakeeb.m3egallery"
REMOTE_APK="/data/local/tmp/m3e-u29.apk"

if [[ ! -f "$APK" ]]; then
  echo "APK not found: $APK" >&2
  exit 1
fi

SERIAL="${SERIAL:-$(adb devices | awk 'NR > 1 && $2 == "device" && $1 !~ /^emulator/ { print $1; exit }')}"
if [[ -z "${SERIAL:-}" ]]; then
  echo "No physical device in 'adb devices'. Connect the phone with USB debugging on." >&2
  exit 1
fi

say() { printf '\n== %s ==\n' "$*"; }
adb_device() { adb -s "$SERIAL" "$@"; }

say "Device"
adb devices -l | awk -v s="$SERIAL" 'NR == 1 || $1 == s'
MODEL="$(adb_device shell getprop ro.product.model | tr -d '\r')"
SOC="$(adb_device shell getprop ro.soc.model | tr -d '\r')"
if [[ -z "$SOC" ]]; then
  SOC="$(adb_device shell getprop ro.board.platform | tr -d '\r')"
fi
ABI="$(adb_device shell getprop ro.product.cpu.abi | tr -d '\r')"
# Report the *active* mode, not the first supported mode. A 120 Hz panel often
# lists 120 before the active 60 Hz mode, which made the first version print
# the wrong refresh rate.
ACTIVE_MODE="$(adb_device shell dumpsys display 2>/dev/null \
  | grep -m1 -oE 'mActiveModeId=[0-9]+' | cut -d= -f2 || true)"
if [[ -n "$ACTIVE_MODE" ]]; then
  REFRESH="$(adb_device shell dumpsys display 2>/dev/null \
    | grep -oE "id=${ACTIVE_MODE},[^}]*fps=[0-9.]+" | grep -m1 -oE 'fps=[0-9.]+' || true)"
else
  REFRESH="$(adb_device shell dumpsys display 2>/dev/null | grep -m1 -oE 'fps=[0-9.]+' || true)"
fi
echo "model=$MODEL soc=$SOC abi=$ABI mode=${ACTIVE_MODE:-unknown} ${REFRESH:-refresh=unknown}"

if [[ "$ABI" != "arm64-v8a" ]]; then
  echo "This APK is arm64-v8a only; device ABI is $ABI." >&2
  exit 1
fi

if [[ "${SKIP_INSTALL:-0}" != "1" ]]; then
  say "Install through root"
  adb_device push "$APK" "$REMOTE_APK"
  # MIUI rejects `adb install` with INSTALL_FAILED_USER_RESTRICTED; a root shell
  # bypasses the user restriction. Approve the su prompt on the phone if shown.
  adb_device shell "su -c 'pm install -r $REMOTE_APK'"
fi

say "Launch and capture (20 s per mode)"
printf '\n| Mode | Renderer | Last M3E_SPIKE_UI line |\n|---|---|---|\n'
for renderer in svg skia; do
  for mode in cycle concurrent clip; do
    adb_device logcat -c
    adb_device shell "am start -S -a android.intent.action.VIEW -d 'm3egallery://?spike=$mode&renderer=$renderer' $PKG" >/dev/null
    sleep 20
    line="$(adb_device logcat -d -s ReactNativeJS:V | grep "M3E_SPIKE_UI $mode/$renderer" | tail -1 || true)"
    printf '| %s | %s | %s |\n' "$mode" "$renderer" "${line:-no log line; read the on-screen card}"
  done
done

say "Done"
cat <<EOF
Record these with the table above and send them back:
- model: $MODEL
- SoC: $SOC
- active refresh: ${REFRESH:-read from the phone (Settings > Display > Refresh rate)}
- the six frame lines (frames / avg / max) or the card values

U-29 stays open until the numbers are recorded in docs/evidence/day7/frame-times.md.
EOF
