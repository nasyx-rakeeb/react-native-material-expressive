import { Platform } from 'react-native';
import type { VariableFontSupport } from './types';

interface VersionLike {
  major: number;
  minor: number;
  patch?: number;
}

interface SupportInput {
  platform: string;
  reactNativeVersion?: VersionLike;
  androidApiLevel?: number;
}

/**
 * Pure capability resolver, exported so the fallback matrix can be tested
 * without a device.
 *
 * `fontVariationSettings` landed in React Native 0.88. Android before API 26
 * accepts the prop but does not apply variable axes reliably, so those devices
 * use static weights too.
 */
export function resolveVariableFontSupport(input: SupportInput): VariableFontSupport {
  const { platform, reactNativeVersion, androidApiLevel } = input;
  const version = reactNativeVersion
    ? `${reactNativeVersion.major}.${reactNativeVersion.minor}${
        reactNativeVersion.patch === undefined ? '' : `.${reactNativeVersion.patch}`
      }`
    : undefined;

  if (!reactNativeVersion) {
    return {
      supported: false,
      reason: 'rn-version-unknown',
      androidApiLevel,
    };
  }

  const rnSupported =
    reactNativeVersion.major > 0 ||
    (reactNativeVersion.major === 0 && reactNativeVersion.minor >= 88);
  if (!rnSupported) {
    return {
      supported: false,
      reason: 'rn-too-old',
      reactNativeVersion: version,
      androidApiLevel,
    };
  }

  if (platform !== 'android' && platform !== 'ios' && platform !== 'web') {
    return {
      supported: false,
      reason: 'platform-unsupported',
      reactNativeVersion: version,
      androidApiLevel,
    };
  }

  if (platform === 'android' && androidApiLevel !== undefined && androidApiLevel < 26) {
    return {
      supported: false,
      reason: 'android-api-too-old',
      reactNativeVersion: version,
      androidApiLevel,
    };
  }

  return {
    supported: true,
    reason: 'supported',
    reactNativeVersion: version,
    androidApiLevel,
  };
}

/** Inspect the running React Native platform. */
export function getVariableFontSupport(): VariableFontSupport {
  const constants = Platform.constants as { reactNativeVersion?: VersionLike } | undefined;
  const apiLevel =
    Platform.OS === 'android' && typeof Platform.Version === 'number'
      ? Platform.Version
      : undefined;
  return resolveVariableFontSupport({
    platform: Platform.OS,
    reactNativeVersion: constants?.reactNativeVersion,
    androidApiLevel: apiLevel,
  });
}

export function supportsVariableFontSettings(): boolean {
  return getVariableFontSupport().supported;
}
