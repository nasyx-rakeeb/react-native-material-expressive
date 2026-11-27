import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Track the platform "remove animations" accessibility setting.
 *
 * Pass `override` to force a value for previews or tests. Components use this to
 * replace spatial springs with an instant change and effects springs with a
 * short fade. The setting is read asynchronously; it defaults to `false` until
 * the first native answer arrives.
 */
export function useReduceMotion(override?: boolean): boolean {
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) {
        setSystemReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReduceMotion,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return override ?? systemReduceMotion;
}
