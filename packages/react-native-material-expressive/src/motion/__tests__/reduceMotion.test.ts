import { REDUCED_EFFECTS_FADE_MS, resolveMotionTimingForState } from '../motionTiming';
import {
  getReduceMotionSnapshot,
  resetReduceMotionStoreForTests,
  subscribeReduceMotion,
} from '../reduceMotionStore';
import { springConfig } from '../spring';

type Listener = (enabled: boolean) => void;

const mockListeners: Listener[] = [];
const mockIsReduceMotionEnabled = jest.fn<Promise<boolean>, []>();
const mockAddEventListener = jest.fn((_event: string, listener: Listener) => {
  mockListeners.push(listener);
  return { remove: jest.fn() };
});

jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isReduceMotionEnabled: () => mockIsReduceMotionEnabled(),
    addEventListener: (event: string, listener: Listener) => mockAddEventListener(event, listener),
  },
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('reduce-motion store', () => {
  beforeEach(() => {
    resetReduceMotionStoreForTests();
    mockListeners.length = 0;
    mockIsReduceMotionEnabled.mockReset();
    mockAddEventListener.mockClear();
  });

  it('starts unknown and conservative instead of assuming motion is allowed', () => {
    expect(getReduceMotionSnapshot()).toEqual({ enabled: true, ready: false });
  });

  it('becomes ready with the native answer', async () => {
    const pending = deferred<boolean>();
    mockIsReduceMotionEnabled.mockReturnValue(pending.promise);
    const seen: boolean[] = [];
    const unsubscribe = subscribeReduceMotion(() => seen.push(getReduceMotionSnapshot().ready));

    expect(getReduceMotionSnapshot()).toEqual({ enabled: true, ready: false });
    pending.resolve(false);
    await flush();

    expect(getReduceMotionSnapshot()).toEqual({ enabled: false, ready: true });
    expect(seen).toEqual([true]);
    unsubscribe();
  });

  it('does not let a late promise overwrite a newer change event', async () => {
    const pending = deferred<boolean>();
    mockIsReduceMotionEnabled.mockReturnValue(pending.promise);
    subscribeReduceMotion(() => {});

    mockListeners[0]?.(true);
    expect(getReduceMotionSnapshot()).toEqual({ enabled: true, ready: true });

    pending.resolve(false);
    await flush();
    expect(getReduceMotionSnapshot()).toEqual({ enabled: true, ready: true });
  });

  it('holds the first animation until ready, then applies the mapping', () => {
    const config = springConfig(380, 0.8);

    expect(resolveMotionTimingForState('spatial', { enabled: true, ready: false }, config)).toEqual(
      {
        type: 'hold',
      },
    );
    expect(resolveMotionTimingForState('spatial', { enabled: true, ready: true }, config)).toEqual({
      type: 'instant',
    });
    expect(resolveMotionTimingForState('effects', { enabled: true, ready: true }, config)).toEqual({
      type: 'fade',
      durationMs: REDUCED_EFFECTS_FADE_MS,
    });
    expect(resolveMotionTimingForState('spatial', { enabled: false, ready: true }, config)).toEqual(
      {
        type: 'spring',
        config,
      },
    );
  });

  it('subscribes to reduceMotionChanged on first use', () => {
    const pending = deferred<boolean>();
    mockIsReduceMotionEnabled.mockReturnValue(pending.promise);
    subscribeReduceMotion(() => {});
    expect(mockAddEventListener).toHaveBeenCalledWith('reduceMotionChanged', expect.any(Function));
  });
});
