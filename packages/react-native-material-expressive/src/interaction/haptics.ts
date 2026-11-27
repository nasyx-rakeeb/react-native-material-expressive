/**
 * Injectable haptics adapter.
 *
 * The library never imports `expo-haptics`, `react-native-haptic-feedback`, or
 * any native module. The default adapter is a no-op; apps opt in by calling
 * `setHapticsAdapter` once at startup. This keeps the peer-dependency surface
 * unchanged and makes the behaviour testable.
 */

export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
export type HapticNotificationType = 'success' | 'warning' | 'error';

export interface M3Haptics {
  impact(style: HapticImpactStyle): void;
  selection(): void;
  notification(type: HapticNotificationType): void;
}

export const NOOP_HAPTICS: M3Haptics = Object.freeze({
  impact() {},
  selection() {},
  notification() {},
});

let adapter: M3Haptics = NOOP_HAPTICS;

/** Install an app-provided adapter. Pass `null` to restore the no-op default. */
export function setHapticsAdapter(next: M3Haptics | null): void {
  adapter = next ?? NOOP_HAPTICS;
}

/** The active adapter. Always returns an object, never `undefined`. */
export function getHapticsAdapter(): M3Haptics {
  return adapter;
}

export type HapticEvent =
  | { readonly type: 'impact'; readonly style: HapticImpactStyle }
  | { readonly type: 'selection' }
  | { readonly type: 'notification'; readonly notification: HapticNotificationType };

/** Fire one haptic event through the active adapter. */
export function performHaptic(event: HapticEvent): void {
  switch (event.type) {
    case 'impact':
      adapter.impact(event.style);
      break;
    case 'selection':
      adapter.selection();
      break;
    case 'notification':
      adapter.notification(event.notification);
      break;
  }
}

/** Test-only reset to the documented no-op default. */
export function resetHapticsAdapterForTests(): void {
  adapter = NOOP_HAPTICS;
}
