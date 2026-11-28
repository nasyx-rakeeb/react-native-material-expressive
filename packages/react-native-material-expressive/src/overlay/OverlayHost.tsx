import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { OverlayFocusTrap } from './FocusTrap';
import { keyboardAvoidingBehavior, mergeInsets } from './platform';
import type { EdgeInsets, OverlayEntry, OverlayRenderApi } from './types';

export interface OverlayHostProps {
  entries: readonly OverlayEntry[];
  insets: EdgeInsets;
  /** Back/Escape/scrim request. The provider decides whether to remove. */
  onDismiss: (id: string) => void;
  /** Immediate removal. */
  onClose: (id: string) => void;
  testID?: string;
}

function OverlayLayer({
  entry,
  isTopmost,
  insets,
  onDismiss,
  onClose,
}: {
  entry: OverlayEntry;
  isTopmost: boolean;
  insets: EdgeInsets;
  onDismiss: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const options = entry.options;
  const layerInsets = mergeInsets(insets, options.insets);
  const api: OverlayRenderApi = {
    id: entry.id,
    close: () => onClose(entry.id),
    dismiss: () => onDismiss(entry.id),
    isTopmost,
  };
  const inert = options.modal && !isTopmost;
  const behavior = options.keyboardAvoiding ? keyboardAvoidingBehavior(Platform.OS) : undefined;
  const trapStyle: ViewStyle =
    options.placement === 'fullscreen'
      ? { flex: 1 }
      : {
          width: '100%',
          alignItems: options.placement === 'center' ? 'center' : 'stretch',
        };

  const body = (
    <View
      pointerEvents="box-none"
      style={{
        flex: 1,
        justifyContent:
          options.placement === 'center'
            ? 'center'
            : options.placement === 'bottom'
              ? 'flex-end'
              : 'flex-start',
        paddingTop: layerInsets.top,
        paddingRight: layerInsets.right,
        paddingBottom: layerInsets.bottom,
        paddingLeft: layerInsets.left,
      }}
    >
      <OverlayFocusTrap
        enabled={options.modal}
        style={trapStyle}
        testID={options.testID === undefined ? undefined : `${options.testID}-focus`}
      >
        {entry.render(api)}
      </OverlayFocusTrap>
    </View>
  );

  return (
    <View
      accessibilityElementsHidden={inert}
      importantForAccessibility={inert ? 'no-hide-descendants' : 'auto'}
      pointerEvents={inert ? 'none' : 'box-none'}
      style={StyleSheet.absoluteFill}
      testID={options.testID}
    >
      {options.modal ? (
        <Pressable
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no"
          onPress={options.dismissible ? () => onDismiss(entry.id) : undefined}
          style={[StyleSheet.absoluteFill, { backgroundColor: options.scrimColor }]}
          testID={options.testID === undefined ? undefined : `${options.testID}-scrim`}
        />
      ) : null}
      {behavior === undefined ? (
        body
      ) : (
        <KeyboardAvoidingView
          behavior={behavior}
          keyboardVerticalOffset={layerInsets.top}
          style={StyleSheet.absoluteFill}
        >
          {body}
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

/**
 * Renders the overlay stack in order. The last entry is topmost; modal layers
 * below it are inert and hidden from assistive technology.
 *
 * `OverlayProvider` owns this component. It is exported so a custom host can
 * reuse the stacking and inset behaviour.
 */
export function OverlayHost({ entries, insets, onDismiss, onClose, testID }: OverlayHostProps) {
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill} testID={testID}>
      {entries.map((entry, index) => (
        <OverlayLayer
          key={entry.id}
          entry={entry}
          insets={insets}
          isTopmost={index === entries.length - 1}
          onClose={onClose}
          onDismiss={onDismiss}
        />
      ))}
    </View>
  );
}
