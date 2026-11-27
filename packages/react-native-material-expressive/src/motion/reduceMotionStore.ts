import { AccessibilityInfo } from 'react-native';

/**
 * Platform reduce-motion state.
 *
 * `AccessibilityInfo.isReduceMotionEnabled()` is asynchronous, so the first
 * render cannot know the user's setting. The store starts in a conservative
 * `enabled: true, ready: false` state: animations must hold until `ready` is
 * true rather than run one frame of full motion for a reduce-motion user.
 */
export interface ReduceMotionSnapshot {
  readonly enabled: boolean;
  readonly ready: boolean;
}

type Listener = () => void;

const INITIAL_SNAPSHOT: ReduceMotionSnapshot = Object.freeze({ enabled: true, ready: false });

let snapshot: ReduceMotionSnapshot = INITIAL_SNAPSHOT;
let started = false;
let subscription: { remove(): void } | null = null;
const listeners = new Set<Listener>();

function emit(next: ReduceMotionSnapshot): void {
  snapshot = next;
  for (const listener of listeners) {
    listener();
  }
}

function start(): void {
  if (started) {
    return;
  }
  started = true;
  void AccessibilityInfo.isReduceMotionEnabled().then(
    (enabled) => {
      // A reduceMotionChanged event may have arrived first; it is newer.
      if (!snapshot.ready) {
        emit({ enabled, ready: true });
      }
    },
    () => {
      if (!snapshot.ready) {
        emit({ enabled: true, ready: true });
      }
    },
  );
  subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
    emit({ enabled, ready: true });
  });
}

/** Subscribe to the shared platform setting. */
export function subscribeReduceMotion(listener: Listener): () => void {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Current snapshot. The object identity is stable until the value changes. */
export function getReduceMotionSnapshot(): ReduceMotionSnapshot {
  return snapshot;
}

/** Server/web snapshot: conservative, never ready. */
export function getReduceMotionServerSnapshot(): ReduceMotionSnapshot {
  return INITIAL_SNAPSHOT;
}

/**
 * Test-only reset. Removes the native subscription and restores the unknown
 * state so each test starts from the same first-mount condition.
 */
export function resetReduceMotionStoreForTests(): void {
  subscription?.remove();
  subscription = null;
  listeners.clear();
  snapshot = INITIAL_SNAPSHOT;
  started = false;
}
