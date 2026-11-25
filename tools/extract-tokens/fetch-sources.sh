#!/usr/bin/env bash
# Downloads the pinned Compose sources JARs used by the token extractor.
# The files are git-ignored; their versions and SHA-256 hashes are committed
# in docs/research/DAY2_SOURCES.md and asserted here on every run.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dest="$here/vendor"
mkdir -p "$dest"

if command -v sha256sum >/dev/null 2>&1; then
  sha256() { sha256sum "$1" | awk '{print $1}'; }
else
  sha256() { shasum -a 256 "$1" | awk '{print $1}'; }
fi

fetch() {
  local group_path="$1" artifact="$2" version="$3" expected="$4"
  local file="$artifact-$version-sources.jar"
  local url="https://dl.google.com/dl/android/maven2/$group_path/$artifact/$version/$file"

  if [[ -f "$dest/$file" ]] && [[ "$(sha256 "$dest/$file")" == "$expected" ]]; then
    echo "ok      $file"
    return
  fi

  echo "fetch   $file"
  curl -fsSL --retry 3 --retry-delay 2 -o "$dest/$file.tmp" "$url"
  local actual
  actual="$(sha256 "$dest/$file.tmp")"
  if [[ "$actual" != "$expected" ]]; then
    rm -f "$dest/$file.tmp"
    echo "sha256 mismatch for $file: expected $expected, got $actual" >&2
    exit 1
  fi
  mv "$dest/$file.tmp" "$dest/$file"
}

fetch androidx/compose/material3 material3 1.5.0 \
  d389bb542a1637dc202e715b279a178be1b0d51886234fe2810a92427c07b2a6
fetch androidx/compose/material3 material3-ripple 1.5.0 \
  1f57e1b16ca4558977d3b4b94beefc8693dd1cb49634cf90dc8aa5ef74704efd
fetch androidx/compose/material3 material3-window-size-class 1.5.0 \
  2bca45d9e3ec62e52e53a7a580838ab89a46fa1ae0750311a5604ffa00e4c521
fetch androidx/compose/material3 material3-adaptive-navigation-suite 1.5.0 \
  fdbc86bff0c7f9f4ca8fdf9097515297af39200f65a82129d269f4a4fe11de64
fetch androidx/compose/material3/adaptive adaptive 1.3.0 \
  557c3abf86a3b2659aafbb0db8441295aae6a1f90e701033a218003ba545541c
fetch androidx/compose/material3/adaptive adaptive-layout 1.3.0 \
  bd87db4bdbf51d7df02872b0c7e95ae82a3b7c61b7f2e021c407d30a899c22ca
fetch androidx/compose/material3/adaptive adaptive-navigation 1.3.0 \
  c64c0ddec14fed5daae373c535c8e81e1f0ef1922aa258b624828448de18346d
fetch androidx/graphics graphics-shapes 1.1.0 \
  50586aa6c7b3a542a51b2abaf659f7a6c33d8c5d637d8f1a57aaf518dcb74f3d

echo "all sources verified in $dest"
