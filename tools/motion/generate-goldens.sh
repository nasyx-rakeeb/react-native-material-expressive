#!/usr/bin/env bash
#
# Regenerates docs/specs/motion/goldens.json from the pinned Material3 artifact.
#
# The golden is produced by SpringGoldenTest through the public MotionScheme API,
# so it covers the token values, the 0.01 visibility threshold, duration
# estimation, and the closed-form spring solution in one trace.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$repo_root/apps/reference-compose"
./gradlew :app:testDebugUnitTest \
  --tests com.nasyxrakeeb.m3ereference.SpringGoldenTest \
  --rerun-tasks \
  --console=plain

mkdir -p "$repo_root/docs/specs/motion"
cp app/build/spring-goldens.json "$repo_root/docs/specs/motion/goldens.json"
echo "Wrote docs/specs/motion/goldens.json"
