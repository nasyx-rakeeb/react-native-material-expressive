import {
  getHapticsAdapter,
  NOOP_HAPTICS,
  performHaptic,
  resetHapticsAdapterForTests,
  setHapticsAdapter,
  type M3Haptics,
} from '../haptics';

describe('haptics adapter', () => {
  beforeEach(() => {
    resetHapticsAdapterForTests();
  });

  afterAll(() => {
    resetHapticsAdapterForTests();
  });

  it('defaults to a documented no-op with no native dependency', () => {
    expect(getHapticsAdapter()).toBe(NOOP_HAPTICS);
    expect(() => performHaptic({ type: 'selection' })).not.toThrow();
    expect(() => performHaptic({ type: 'impact', style: 'light' })).not.toThrow();
    expect(() => performHaptic({ type: 'notification', notification: 'success' })).not.toThrow();
  });

  it('routes every event to an installed adapter', () => {
    const calls: string[] = [];
    const adapter: M3Haptics = {
      impact(style) {
        calls.push(`impact:${style}`);
      },
      selection() {
        calls.push('selection');
      },
      notification(type) {
        calls.push(`notification:${type}`);
      },
    };
    setHapticsAdapter(adapter);
    expect(getHapticsAdapter()).toBe(adapter);

    performHaptic({ type: 'impact', style: 'medium' });
    performHaptic({ type: 'selection' });
    performHaptic({ type: 'notification', notification: 'warning' });

    expect(calls).toEqual(['impact:medium', 'selection', 'notification:warning']);
  });

  it('restores the no-op default with null', () => {
    setHapticsAdapter({
      impact() {},
      selection() {},
      notification() {},
    });
    setHapticsAdapter(null);
    expect(getHapticsAdapter()).toBe(NOOP_HAPTICS);
  });
});
