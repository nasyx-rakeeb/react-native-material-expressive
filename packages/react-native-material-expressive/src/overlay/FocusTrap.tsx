import { useEffect, useRef, type ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Wrap the next focus index. `current` may be -1 when focus is outside the
 * trap; forward Tab then starts at 0, backward Tab starts at the last item.
 */
export function nextFocusIndex(current: number, count: number, shift: boolean): number {
  if (count <= 0) return -1;
  if (current < 0 || current >= count) return shift ? count - 1 : 0;
  return shift ? (current - 1 + count) % count : (current + 1) % count;
}

function useWebFocusTrap(
  ref: React.RefObject<React.ComponentRef<typeof View> | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled || Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    const node = ref.current as unknown as HTMLElement | null;
    if (!node || typeof node.querySelectorAll !== 'function') {
      return;
    }

    const previous = document.activeElement as HTMLElement | null;
    const focusable = (): HTMLElement[] =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const first = focusable()[0];
    first?.focus();

    const listener = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement;
      const current = items.indexOf(active as HTMLElement);
      const next = nextFocusIndex(current, items.length, event.shiftKey);
      event.preventDefault();
      items[next]?.focus();
    };

    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
      if (previous && previous !== document.body && typeof previous.focus === 'function') {
        previous.focus();
      }
    };
  }, [enabled, ref]);
}

export interface OverlayFocusTrapProps {
  enabled: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Assistive-technology focus containment.
 *
 * - iOS: `accessibilityViewIsModal` makes VoiceOver ignore siblings.
 * - Android: the provider hides the app subtree with
 *   `importantForAccessibility="no-hide-descendants"`; this node is marked
 *   `yes` so TalkBack stays inside.
 * - Web: a real Tab/Shift+Tab trap with focus restore.
 *
 * RN core cannot move native keyboard focus between arbitrary views; on
 * native the platform's accessibility focus is the containment mechanism.
 */
export function OverlayFocusTrap({ enabled, children, style, testID }: OverlayFocusTrapProps) {
  const ref = useRef<React.ComponentRef<typeof View>>(null);
  useWebFocusTrap(ref, enabled);

  return (
    <View
      ref={ref}
      accessibilityViewIsModal={enabled}
      importantForAccessibility={enabled ? 'yes' : 'auto'}
      style={style}
      testID={testID}
    >
      {children}
    </View>
  );
}
