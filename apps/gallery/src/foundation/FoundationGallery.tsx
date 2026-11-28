import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  I18nManager,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Icon,
  MaterialSymbol,
  M3ThemeProvider,
  OverlayProvider,
  Portal,
  Surface,
  getVariableFontSupport,
  mirrorIconTransform,
  resolveRowDirection,
  resolveStartEnd,
  resolveTextAlign,
  useM3Theme,
  useOverlay,
  useWindowSizeClass,
  type MaterialSymbolAxes,
  type MaterialSymbolName,
} from 'react-native-material-expressive';

const AXIS_ROWS: Array<{
  axis: string;
  values: Array<{ label: string; props: MaterialSymbolAxes }>;
}> = [
  {
    axis: 'FILL',
    values: [
      { label: '0', props: { fill: 0 } },
      { label: '1', props: { fill: 1 } },
    ],
  },
  {
    axis: 'wght',
    values: [
      { label: '100', props: { weight: 100 } },
      { label: '400', props: { weight: 400 } },
      { label: '700', props: { weight: 700 } },
    ],
  },
  {
    axis: 'GRAD',
    values: [
      { label: '-50', props: { grade: -50 } },
      { label: '0', props: { grade: 0 } },
      { label: '200', props: { grade: 200 } },
    ],
  },
  {
    axis: 'opsz',
    values: [
      { label: '20', props: { opticalSize: 20 } },
      { label: '24', props: { opticalSize: 24 } },
      { label: '48', props: { opticalSize: 48 } },
    ],
  },
];

const PATH_ICONS = [
  'check',
  'close',
  'menu',
  'search',
  'arrow_back',
  'arrow_forward',
  'chevron_right',
  'expand_more',
  'add',
  'remove',
  'more_vert',
  'star',
] as const;

const SAMPLE_SYMBOLS: MaterialSymbolName[] = ['star', 'favorite', 'settings', 'home', 'info'];

export default function FoundationGallery() {
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

function Shell() {
  const insets = useSafeAreaInsets();
  return (
    <M3ThemeProvider>
      <OverlayProvider insets={insets} testID="foundation-overlays">
        <StatusBar style="dark" />
        <FoundationContent topInset={insets.top} />
      </OverlayProvider>
    </M3ThemeProvider>
  );
}

function FoundationContent({ topInset }: { topInset: number }) {
  const theme = useM3Theme();
  const overlay = useOverlay();
  const windowSize = useWindowSizeClass();
  const { width, height } = useWindowDimensions();
  const support = getVariableFontSupport();
  const reactNativeVersion = (
    Platform.constants as { reactNativeVersion?: { major: number; minor: number } } | undefined
  )?.reactNativeVersion;
  const [portalVisible, setPortalVisible] = useState(false);
  const [previewRtl, setPreviewRtl] = useState(false);
  const [lastAction, setLastAction] = useState('none');
  const autoOpened = useRef(false);

  const openSheet = useCallback(() => {
    const id = overlay.open(({ close }) => <DemoSheet close={close} />, {
      placement: 'bottom',
      testID: 'demo-sheet',
    });
    setLastAction(`opened sheet ${id}`);
    console.log(`[M3E] overlay_open ${id} placement=bottom`);
  }, [overlay]);

  const openDialog = useCallback(() => {
    const id = overlay.open(({ close }) => <DemoDialog close={close} onOpenSheet={openSheet} />, {
      placement: 'center',
      testID: 'demo-dialog',
    });
    setLastAction(`opened dialog ${id}`);
    console.log(`[M3E] overlay_open ${id} placement=center`);
  }, [overlay, openSheet]);

  useEffect(() => {
    console.log(`[M3E] overlay_stack ${overlay.stack.join(',') || 'empty'}`);
  }, [overlay.stack]);

  useEffect(() => {
    if (autoOpened.current) return;
    void Linking.getInitialURL().then((url) => {
      if (autoOpened.current) return;
      const match = /[?&]overlay=([a-z]+)/.exec(url ?? '');
      if (!match) return;
      autoOpened.current = true;
      if (match[1] === 'sheet') {
        openSheet();
      } else if (match[1] === 'portal') {
        setPortalVisible(true);
      } else if (match[1] === 'stack') {
        openDialog();
        openSheet();
      } else {
        openDialog();
      }
    });
  }, [openDialog, openSheet]);

  const direction = previewRtl ? 'rtl' : 'ltr';
  const startEnd = resolveStartEnd(direction, 16, 24);
  const rowDirection = resolveRowDirection(direction);
  const textAlign = resolveTextAlign(direction, 'start');

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 20, backgroundColor: theme.colorScheme.surface },
      ]}
      testID="foundation-scroll"
    >
      <Text style={[styles.kicker, { color: theme.colorScheme.primary }]}>
        DAY 10 · FOUNDATION GATE
      </Text>
      <Text style={[styles.title, { color: theme.colorScheme.onSurface }]}>
        Icon, overlay, window and RTL
      </Text>
      <Text style={[styles.body, { color: theme.colorScheme.onSurfaceVariant }]}>
        The four foundations added for Day 10. Every control below is real: the overlays share one
        stack, the size classes recompute with the window, and the RTL preview uses the exported
        helpers rather than a second copy of the logic.
      </Text>

      <Section title="Material Symbols axes" theme={theme}>
        <Text style={[styles.note, { color: theme.colorScheme.onSurfaceVariant }]}>
          Variable-font support: {support.supported ? 'yes' : 'no'} ({support.reason}
          {Platform.OS === 'android' ? `, API ${String(Platform.Version)}` : ''}). Axes outside the
          upstream ranges are clamped by the component.
        </Text>
        {AXIS_ROWS.map((row) => (
          <View key={row.axis} style={styles.axisRow}>
            <Text style={[styles.axisLabel, { color: theme.colorScheme.onSurfaceVariant }]}>
              {row.axis}
            </Text>
            <View style={styles.axisValues}>
              {row.values.map((value) => (
                <View key={value.label} style={styles.axisCell}>
                  <MaterialSymbol
                    accessibilityLabel={`star ${row.axis} ${value.label}`}
                    name="star"
                    size={32}
                    {...value.props}
                  />
                  <Text style={[styles.axisValue, { color: theme.colorScheme.onSurfaceVariant }]}>
                    {value.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        <View style={styles.iconWrap}>
          {SAMPLE_SYMBOLS.map((name) => (
            <MaterialSymbol key={name} accessibilityLabel={name} name={name} size={28} />
          ))}
        </View>
      </Section>

      <Section title="Internal path icons" theme={theme}>
        <Text style={[styles.note, { color: theme.colorScheme.onSurfaceVariant }]}>
          Twelve glyphs drawn from SVG path data, no font asset. Directional glyphs mirror in RTL
          when asked; logos and checkmarks do not.
        </Text>
        <View style={styles.iconWrap}>
          {PATH_ICONS.map((name) => (
            <View key={name} style={styles.pathCell}>
              <Icon accessibilityLabel={name} name={name} size={28} />
              <Text style={[styles.pathLabel, { color: theme.colorScheme.onSurfaceVariant }]}>
                {name}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Window size class" theme={theme}>
        <Text style={[styles.metric, { color: theme.colorScheme.onSurface }]}>
          {Math.round(width)} × {Math.round(height)} dp
        </Text>
        <Text style={[styles.body, { color: theme.colorScheme.onSurfaceVariant }]}>
          width: {windowSize.widthSizeClass} · height: {windowSize.heightSizeClass}
        </Text>
        <Text style={[styles.note, { color: theme.colorScheme.onSurfaceVariant }]}>
          Compose breakpoints: width 600/840 dp, height 480/900 dp, inclusive lower bounds. Resizing
          the window or rotating the device recomputes both classes.
        </Text>
      </Section>

      <Section title="RTL utilities" theme={theme}>
        <Text style={[styles.note, { color: theme.colorScheme.onSurfaceVariant }]}>
          Process direction: {I18nManager.isRTL ? 'rtl' : 'ltr'}. The preview below is local and
          does not restart the app.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPreviewRtl((value) => !value)}
          style={[styles.button, { backgroundColor: theme.colorScheme.secondaryContainer }]}
        >
          <Text style={[styles.buttonText, { color: theme.colorScheme.onSecondaryContainer }]}>
            Preview {previewRtl ? 'LTR' : 'RTL'}
          </Text>
        </Pressable>
        <View style={styles.rtlPreview}>
          <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 12 }}>
            <View style={mirrorIconTransform(direction)}>
              <Icon name="arrow_back" size={24} />
            </View>
            <Text style={{ color: theme.colorScheme.onSurface, textAlign, flex: 1 }}>
              start → end
            </Text>
            <View style={mirrorIconTransform(direction)}>
              <Icon name="arrow_forward" size={24} />
            </View>
          </View>
          <Text style={[styles.note, { color: theme.colorScheme.onSurfaceVariant }]}>
            start/end padding: left {startEnd.left}, right {startEnd.right} · textAlign: {textAlign}
          </Text>
        </View>
      </Section>

      <Section title="Overlay stack" theme={theme}>
        <Text style={[styles.body, { color: theme.colorScheme.onSurfaceVariant }]}>
          Stack depth: {overlay.stack.length}
          {overlay.topId === null ? '' : ` · top: ${overlay.topId}`}. Back and Escape dismiss only
          the topmost layer; the scrim closes the layer it belongs to.
        </Text>
        <Text style={[styles.note, { color: theme.colorScheme.onSurfaceVariant }]}>
          Last action: {lastAction}
        </Text>
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            onPress={openDialog}
            style={[styles.button, { backgroundColor: theme.colorScheme.primary }]}
          >
            <Text style={[styles.buttonText, { color: theme.colorScheme.onPrimary }]}>
              Open dialog
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={openSheet}
            style={[styles.button, { backgroundColor: theme.colorScheme.secondaryContainer }]}
          >
            <Text style={[styles.buttonText, { color: theme.colorScheme.onSecondaryContainer }]}>
              Open sheet
            </Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPortalVisible(true)}
          style={[styles.button, { backgroundColor: theme.colorScheme.secondaryContainer }]}
        >
          <Text style={[styles.buttonText, { color: theme.colorScheme.onSecondaryContainer }]}>
            Open declarative portal
          </Text>
        </Pressable>
        <Portal
          onClose={() => setPortalVisible(false)}
          testID="demo-portal"
          visible={portalVisible}
        >
          <DemoCard
            title="Declarative portal"
            subtitle="<Portal visible> mounts into the same overlay stack."
            onClose={() => setPortalVisible(false)}
          />
        </Portal>
      </Section>

      <Text style={[styles.footer, { color: theme.colorScheme.onSurfaceVariant }]}>
        Day 10 gallery · {Platform.OS} · RN {String(reactNativeVersion?.major ?? '?')}.
        {String(reactNativeVersion?.minor ?? '?')}
      </Text>
    </ScrollView>
  );
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: ReturnType<typeof useM3Theme>;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colorScheme.onSurface }]}>{title}</Text>
      {children}
    </View>
  );
}

function DemoCard({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children?: ReactNode;
}) {
  const theme = useM3Theme();
  return (
    <Surface color={theme.colorScheme.surface} shape={28} style={styles.card} tonalElevation={3}>
      <Text style={[styles.cardTitle, { color: theme.colorScheme.onSurface }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.colorScheme.onSurfaceVariant }]}>{subtitle}</Text>
      {children}
      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={[styles.button, { backgroundColor: theme.colorScheme.primary }]}
      >
        <Text style={[styles.buttonText, { color: theme.colorScheme.onPrimary }]}>Close</Text>
      </Pressable>
    </Surface>
  );
}

function DemoDialog({ close, onOpenSheet }: { close: () => void; onOpenSheet: () => void }) {
  const theme = useM3Theme();
  return (
    <DemoCard
      onClose={close}
      subtitle="Center modal. It traps accessibility focus and hides the app subtree from TalkBack."
      title="Overlay dialog"
    >
      <TextInput
        accessibilityLabel="Keyboard avoidance probe"
        placeholder="Keyboard avoidance probe"
        placeholderTextColor={theme.colorScheme.onSurfaceVariant}
        style={[
          styles.input,
          {
            borderColor: theme.colorScheme.outline,
            color: theme.colorScheme.onSurface,
          },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onOpenSheet}
        style={[styles.button, { backgroundColor: theme.colorScheme.secondaryContainer }]}
      >
        <Text style={[styles.buttonText, { color: theme.colorScheme.onSecondaryContainer }]}>
          Open sheet on top
        </Text>
      </Pressable>
    </DemoCard>
  );
}

function DemoSheet({ close }: { close: () => void }) {
  const theme = useM3Theme();
  return (
    <View style={[styles.sheet, { backgroundColor: theme.colorScheme.surface }]}>
      <Text style={[styles.cardTitle, { color: theme.colorScheme.onSurface }]}>Bottom sheet</Text>
      <Text style={[styles.body, { color: theme.colorScheme.onSurfaceVariant }]}>
        Bottom placement inside the safe-area insets. The Android back button dismisses this sheet
        first, then the dialog underneath.
      </Text>
      <TextInput
        accessibilityLabel="Sheet keyboard probe"
        placeholder="Focus me to test keyboard avoidance"
        placeholderTextColor={theme.colorScheme.onSurfaceVariant}
        style={[
          styles.input,
          { borderColor: theme.colorScheme.outline, color: theme.colorScheme.onSurface },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        onPress={close}
        style={[styles.button, { backgroundColor: theme.colorScheme.primary }]}
      >
        <Text style={[styles.buttonText, { color: theme.colorScheme.onPrimary }]}>Close sheet</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 8,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    marginTop: 28,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  axisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  axisLabel: {
    width: 48,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  axisValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  axisCell: {
    alignItems: 'center',
    gap: 4,
  },
  axisValue: {
    fontSize: 11,
  },
  iconWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 18,
    marginTop: 4,
  },
  pathCell: {
    alignItems: 'center',
    gap: 4,
    width: 72,
  },
  pathLabel: {
    fontSize: 10,
  },
  metric: {
    fontSize: 26,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rtlPreview: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CAC4D0',
  },
  card: {
    width: '88%',
    maxWidth: 420,
    padding: 24,
    gap: 14,
    borderRadius: 28,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  sheet: {
    width: '100%',
    padding: 24,
    paddingBottom: 36,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 14,
  },
  footer: {
    marginTop: 36,
    fontSize: 11,
  },
});
