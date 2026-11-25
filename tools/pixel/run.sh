#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="${M3E_OUT:-$ROOT/docs/evidence/day3}"

mkdir -p "$OUT"
rm -rf "$OUT/captures" "$OUT/diffs"

cd "$ROOT"
node tools/pixel/run.mjs "$@" 2>&1 | tee "$OUT/run.log"
