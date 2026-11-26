#!/usr/bin/env bash
#
# Regenerates docs/specs/shapes/goldens.json from the pinned AndroidX artifacts.
#
# androidx.compose.material3:material3:1.5.0 resolves graphics-shapes 1.0.1
# transitively, so the reference app pins androidx.graphics:graphics-shapes:1.1.0
# explicitly. Do not remove that dependency.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$repo_root/apps/reference-compose"
./gradlew :app:testDebugUnitTest \
  --tests com.nasyxrakeeb.m3ereference.ShapeGoldenTest \
  --rerun-tasks \
  --console=plain

mkdir -p "$repo_root/docs/specs/shapes"
cp app/build/shapes-goldens.json "$repo_root/docs/specs/shapes/goldens.json"
echo "Wrote docs/specs/shapes/goldens.json"
