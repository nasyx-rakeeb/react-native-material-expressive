import { useMemo, useSyncExternalStore } from 'react';

import {
  getReduceMotionServerSnapshot,
  getReduceMotionSnapshot,
  subscribeReduceMotion,
  type ReduceMotionSnapshot,
} from './reduceMotionStore';

export type ReduceMotionState = ReduceMotionSnapshot;

/**
 * Track the platform "remove animations" accessibility setting together with
 * whether the native answer has arrived.
 *
 * Pass `override` to force a value for previews or tests; an override is
 * immediately ready. Until the native answer arrives the snapshot is
 * `{ enabled: true, ready: false }`; animation hooks hold their first
 * animation instead of running one frame of full motion.
 */
export function useReduceMotionState(override?: boolean): ReduceMotionState {
  const snapshot = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotionSnapshot,
    getReduceMotionServerSnapshot,
  );
  const forced = useMemo(
    () => (override === undefined ? null : { enabled: override, ready: true }),
    [override],
  );
  return forced ?? snapshot;
}

/**
 * Track the platform "remove animations" accessibility setting.
 *
 * Returns `true` until the native answer arrives, which is the safe default:
 * a reduce-motion user never sees a frame of full motion. Components that
 * animate should use `useReduceMotionState` so they can hold the first
 * animation until `ready` instead of starting in the reduced state.
 */
export function useReduceMotion(override?: boolean): boolean {
  return useReduceMotionState(override).enabled;
}
