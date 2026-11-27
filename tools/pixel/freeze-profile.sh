#!/usr/bin/env bash
set -euo pipefail

adb wait-for-device

# Freeze every runtime input that can change pixels. The AVD itself pins the
# screen size, API level, and device profile; this script pins the settings that
# live in the userdata partition. Diagnostic runs may override density/font
# scale through M3E_DENSITY / M3E_FONT_SCALE.
if [ -n "${M3E_DENSITY:-}" ]; then
  adb shell wm density "$M3E_DENSITY"
else
  adb shell wm density reset
fi
FONT_SCALE="${M3E_FONT_SCALE:-1.0}"
adb shell settings put system font_scale "$FONT_SCALE"
adb shell settings put global animator_duration_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global window_animation_scale 0
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 0
adb shell settings put secure immersive_mode_confirmations confirmed
adb shell settings put global heads_up_notifications_enabled 0
adb shell settings put system screen_off_timeout 2147483647
adb shell settings put global stay_on_while_plugged_in 3
adb shell cmd uimode night no
adb shell svc wifi disable || true
adb shell svc data disable || true
adb shell locksettings set-disabled true || true
adb shell input keyevent 82 || true

echo "frozen: font_scale=$FONT_SCALE animations=0 rotation=0 night=no immersive_confirmed"
