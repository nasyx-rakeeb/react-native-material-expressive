export interface SourceArtifact {
  group: string;
  artifact: string;
  version: string;
  sha256: string;
}

/**
 * Pinned Compose sources used by the token extractor.
 * Keep in sync with `fetch-sources.sh` and `docs/research/DAY2_SOURCES.md`.
 */
export const SOURCES: readonly SourceArtifact[] = [
  {
    group: 'androidx.compose.material3',
    artifact: 'material3',
    version: '1.5.0',
    sha256: 'd389bb542a1637dc202e715b279a178be1b0d51886234fe2810a92427c07b2a6',
  },
  {
    group: 'androidx.compose.material3',
    artifact: 'material3-ripple',
    version: '1.5.0',
    sha256: '1f57e1b16ca4558977d3b4b94beefc8693dd1cb49634cf90dc8aa5ef74704efd',
  },
  {
    group: 'androidx.compose.material3',
    artifact: 'material3-window-size-class',
    version: '1.5.0',
    sha256: '2bca45d9e3ec62e52e53a7a580838ab89a46fa1ae0750311a5604ffa00e4c521',
  },
  {
    group: 'androidx.compose.material3',
    artifact: 'material3-adaptive-navigation-suite',
    version: '1.5.0',
    sha256: 'fdbc86bff0c7f9f4ca8fdf9097515297af39200f65a82129d269f4a4fe11de64',
  },
  {
    group: 'androidx.compose.material3.adaptive',
    artifact: 'adaptive',
    version: '1.3.0',
    sha256: '557c3abf86a3b2659aafbb0db8441295aae6a1f90e701033a218003ba545541c',
  },
  {
    group: 'androidx.compose.material3.adaptive',
    artifact: 'adaptive-layout',
    version: '1.3.0',
    sha256: 'bd87db4bdbf51d7df02872b0c7e95ae82a3b7c61b7f2e021c407d30a899c22ca',
  },
  {
    group: 'androidx.compose.material3.adaptive',
    artifact: 'adaptive-navigation',
    version: '1.3.0',
    sha256: 'c64c0ddec14fed5daae373c535c8e81e1f0ef1922aa258b624828448de18346d',
  },
  {
    group: 'androidx.graphics',
    artifact: 'graphics-shapes',
    version: '1.1.0',
    sha256: '50586aa6c7b3a542a51b2abaf659f7a6c33d8c5d637d8f1a57aaf518dcb74f3d',
  },
];

export const MATERIAL3 = SOURCES[0] as SourceArtifact;

/**
 * The common sources JAR contains the `expect` declaration for
 * `defaultPlatformTextStyle()`, but the Android `actual` lives in the
 * multiplatform sources JAR. It is fetched separately because its filename
 * uses a classifier and it is not one of the token-bearing artifacts.
 */
export const TYPOGRAPHY_DEFAULTS = {
  group: 'androidx.compose.material3',
  artifact: 'material3',
  version: '1.5.0',
  classifier: 'multiplatform-sources',
  fileName: 'material3-1.5.0-multiplatform-sources.jar',
  targetName: 'material3-1.5.0-multiplatform',
  sha256: '0fb7c8186c7beb33027aa953baf9bddb131ed765548709b84aa0fb73df10c79c',
  androidPlatformTextStyle:
    'androidMain/androidx/compose/material3/internal/DefaultPlatformTextStyle.android.kt',
} as const;
