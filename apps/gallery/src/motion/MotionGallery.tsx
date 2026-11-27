import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Line, Polyline } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import {
  expressiveMotionScheme,
  springDurationMillis,
  springValueAtMillis,
  standardMotionScheme,
  useReduceMotion,
  useSpring,
  type MotionKind,
  type MotionSchemeName,
  type MotionSpeed,
  type MotionSpringToken,
} from 'react-native-material-expressive';

const STANDARD_COLOR = '#4F5B92';
const EXPRESSIVE_COLOR = '#984061';
const TARGET_COLOR = '#1C1A17';

const TOKENS: readonly {
  scheme: MotionSchemeName;
  token: MotionSpringToken;
  kind: MotionKind;
  speed: MotionSpeed;
}[] = [
  { scheme: 'standard', token: 'defaultSpatial', kind: 'spatial', speed: 'default' },
  { scheme: 'standard', token: 'fastSpatial', kind: 'spatial', speed: 'fast' },
  { scheme: 'standard', token: 'slowSpatial', kind: 'spatial', speed: 'slow' },
  { scheme: 'standard', token: 'defaultEffects', kind: 'effects', speed: 'default' },
  { scheme: 'standard', token: 'fastEffects', kind: 'effects', speed: 'fast' },
  { scheme: 'standard', token: 'slowEffects', kind: 'effects', speed: 'slow' },
  { scheme: 'expressive', token: 'defaultSpatial', kind: 'spatial', speed: 'default' },
  { scheme: 'expressive', token: 'fastSpatial', kind: 'spatial', speed: 'fast' },
  { scheme: 'expressive', token: 'slowSpatial', kind: 'spatial', speed: 'slow' },
  { scheme: 'expressive', token: 'defaultEffects', kind: 'effects', speed: 'default' },
  { scheme: 'expressive', token: 'fastEffects', kind: 'effects', speed: 'fast' },
  { scheme: 'expressive', token: 'slowEffects', kind: 'effects', speed: 'slow' },
];

const CHART_MS = 520;
const CHART_STEP_MS = 4;
const CHART_TOP = 1.15;
const CHART_BOTTOM = -0.1;
const CHART_HEIGHT = 150;

function buildCurves(): { scheme: MotionSchemeName; token: MotionSpringToken; points: string }[] {
  const result: { scheme: MotionSchemeName; token: MotionSpringToken; points: string }[] = [];
  for (const entry of TOKENS) {
    const scheme = entry.scheme === 'standard' ? standardMotionScheme : expressiveMotionScheme;
    const config = scheme.spring(entry.token);
    const points: string[] = [];
    for (let ms = 0; ms <= CHART_MS; ms += CHART_STEP_MS) {
      points.push(
        `${((ms / CHART_MS) * 100).toFixed(2)},${(((CHART_TOP - springValueAtMillis(config, 0, 1, 0, ms)) / (CHART_TOP - CHART_BOTTOM)) * 100).toFixed(2)}`,
      );
    }
    result.push({ scheme: entry.scheme, token: entry.token, points: points.join(' ') });
  }
  return result;
}

const CURVES = buildCurves();

function curveOpacity(scheme: MotionSchemeName, token: MotionSpringToken): number {
  const speed = token.startsWith('fast') ? 0.95 : token.startsWith('slow') ? 0.4 : 0.65;
  return speed * (scheme === 'standard' ? 0.85 : 1);
}

function Track({
  progress,
  color,
  reduceMotion,
  effects,
}: {
  progress: SharedValue<number>;
  color: string;
  reduceMotion: boolean;
  effects?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const marker = 18;
  const overshoot = 22;
  const travel = Math.max(0, width - marker - overshoot * 2);

  return (
    <View style={styles.track} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.trackBaseline} />
      {width > 0 ? (
        <View style={[styles.trackTarget, { left: overshoot + travel + marker / 2 }]} />
      ) : null}
      <Marker progress={progress} travel={travel} overshoot={overshoot} color={color} />
      <View style={styles.trackMetaRow} pointerEvents="none">
        <Text style={styles.trackMeta}>0</Text>
        <Text style={styles.trackMeta}>
          {reduceMotion ? (effects ? 'fade 100 ms' : 'instant') : 'spring'}
        </Text>
        <Text style={styles.trackMeta}>1</Text>
      </View>
    </View>
  );
}

function Marker({
  progress,
  travel,
  overshoot,
  color,
}: {
  progress: SharedValue<number>;
  travel: number;
  overshoot: number;
  color: string;
}) {
  const animated = useMarkerStyle(progress, travel, overshoot);
  return <Animated.View style={[styles.marker, animated, { backgroundColor: color }]} />;
}

function useMarkerStyle(progress: SharedValue<number>, travel: number, overshoot: number) {
  return useAnimatedStyle(() => ({
    transform: [{ translateX: overshoot + progress.value * travel }],
  }));
}

function TokenRow({
  entry,
  phase,
  scheme,
  reduceMotion,
}: {
  entry: (typeof TOKENS)[number];
  phase: number;
  scheme: MotionSchemeName;
  reduceMotion: boolean;
}) {
  const activeScheme = scheme === 'standard' ? standardMotionScheme : expressiveMotionScheme;
  const config = activeScheme.spring(entry.token);
  const progress = useSpring(phase, {
    scheme,
    kind: entry.kind,
    speed: entry.speed,
    reduceMotion,
    initialValue: 0,
  });
  const duration = reduceMotion
    ? entry.kind === 'spatial'
      ? 'instant'
      : '100 ms fade'
    : `${springDurationMillis(config, 0, 1, 0)} ms`;

  return (
    <View style={styles.tokenRow}>
      <View style={styles.tokenHeader}>
        <Text style={styles.tokenName}>
          <Text
            style={[
              styles.tokenScheme,
              { color: entry.scheme === 'standard' ? STANDARD_COLOR : EXPRESSIVE_COLOR },
            ]}
          >
            {entry.scheme}
          </Text>
          {'  '}
          {entry.token}
        </Text>
        <Text style={styles.tokenMeta}>
          k {config.stiffness} · ζ {config.dampingRatio} · {duration}
        </Text>
      </View>
      <Track
        progress={progress}
        color={entry.scheme === 'standard' ? STANDARD_COLOR : EXPRESSIVE_COLOR}
        reduceMotion={reduceMotion}
        effects={entry.kind === 'effects'}
      />
    </View>
  );
}

function DriverComparison({
  phase,
  reduceMotion,
  scheme,
}: {
  phase: number;
  reduceMotion: boolean;
  scheme: MotionSchemeName;
}) {
  const config = (scheme === 'standard' ? standardMotionScheme : expressiveMotionScheme).spring(
    'fastSpatial',
  );
  const custom = useSpring(phase, {
    scheme,
    kind: 'spatial',
    speed: 'fast',
    reduceMotion,
    initialValue: 0,
  });
  const stock = useSharedValue(0);
  useEffect(() => {
    stock.value = reduceMotion
      ? phase
      : withSpring(phase, {
          stiffness: config.stiffness,
          damping: 2 * config.dampingRatio * Math.sqrt(config.stiffness),
          mass: 1,
        });
  }, [config, phase, reduceMotion, stock]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Driver comparison · {scheme} fastSpatial</Text>
      <Text style={styles.cardBody}>
        Material3 clamps at its 0.01 threshold after {springDurationMillis(config, 0, 1, 0)} ms.
        Reanimated keeps moving until its energy ratio reaches 6e-9, roughly twice as long.
      </Text>
      <Text style={styles.compareLabel}>
        Material3 driver · {springDurationMillis(config, 0, 1, 0)} ms
      </Text>
      <Track progress={custom} color={EXPRESSIVE_COLOR} reduceMotion={reduceMotion} />
      <Text style={styles.compareLabel}>Reanimated withSpring · energy threshold 6e-9</Text>
      <Track progress={stock} color="#6B6257" reduceMotion={reduceMotion} />
    </View>
  );
}

function ReduceMotionDemo({ phase, reduceMotion }: { phase: number; reduceMotion: boolean }) {
  const spatial = useSpring(phase, {
    kind: 'spatial',
    speed: 'default',
    reduceMotion,
    initialValue: 0,
  });
  const effects = useSpring(phase, {
    kind: 'effects',
    speed: 'default',
    reduceMotion,
    initialValue: 0,
  });

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Reduce motion mapping</Text>
      <Text style={styles.cardBody}>
        Spatial motion becomes instant; effects motion becomes a 100 ms linear fade.
      </Text>
      <Text style={styles.compareLabel}>spatial · {reduceMotion ? 'instant' : '228 ms'}</Text>
      <Track progress={spatial} color={EXPRESSIVE_COLOR} reduceMotion={reduceMotion} />
      <Text style={styles.compareLabel}>effects · {reduceMotion ? '100 ms fade' : '165 ms'}</Text>
      <Track progress={effects} color={STANDARD_COLOR} reduceMotion={reduceMotion} effects />
    </View>
  );
}

function CurveChart() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Spring curves</Text>
      <Text style={styles.cardBody}>
        All twelve MotionScheme springs, sampled at 4 ms. Flat after each token&apos;s estimated
        duration, matching TargetBasedAnimation.
      </Text>
      <Svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={styles.chart}
      >
        <Line
          x1={0}
          y1={((CHART_TOP - 1) / (CHART_TOP - CHART_BOTTOM)) * 100}
          x2={100}
          y2={((CHART_TOP - 1) / (CHART_TOP - CHART_BOTTOM)) * 100}
          stroke={TARGET_COLOR}
          strokeWidth={0.4}
          strokeDasharray="1.5 1.5"
        />
        {[0, 100, 200, 300, 400, 500].map((ms) => (
          <Line
            key={ms}
            x1={(ms / CHART_MS) * 100}
            y1={0}
            x2={(ms / CHART_MS) * 100}
            y2={100}
            stroke="#D8D0C5"
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {CURVES.map((curve) => (
          <Polyline
            key={`${curve.scheme}-${curve.token}`}
            points={curve.points}
            fill="none"
            stroke={curve.scheme === 'standard' ? STANDARD_COLOR : EXPRESSIVE_COLOR}
            strokeOpacity={curveOpacity(curve.scheme, curve.token)}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </Svg>
      <View style={styles.axis}>
        {[0, 100, 200, 300, 400, 500].map((ms) => (
          <Text key={ms} style={styles.axisText}>
            {ms}
          </Text>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={[styles.swatch, { backgroundColor: STANDARD_COLOR }]} />
        <Text style={styles.legendText}>standard</Text>
        <View style={[styles.swatch, { backgroundColor: EXPRESSIVE_COLOR }]} />
        <Text style={styles.legendText}>expressive</Text>
        <Text style={styles.legendText}>fast / default / slow opacity</Text>
      </View>
    </View>
  );
}

export default function MotionGallery({
  initialScheme = 'expressive',
  initialReduce = 'system',
}: {
  initialScheme?: MotionSchemeName;
  initialReduce?: 'system' | 'on' | 'off';
}) {
  const [scheme, setScheme] = useState<MotionSchemeName>(initialScheme);
  const [reduceOverride, setReduceOverride] = useState<'system' | 'on' | 'off'>(initialReduce);
  const [phase, setPhase] = useState(0);
  const systemReduce = useReduceMotion();
  const reduceMotion = reduceOverride === 'system' ? systemReduce : reduceOverride === 'on';

  useEffect(() => {
    console.log(
      `[M3E] motion_demo scheme=${scheme} reduce=${reduceOverride} effectiveReduce=${String(reduceMotion)}`,
    );
  }, [reduceMotion, reduceOverride, scheme]);

  const play = () => {
    const next = phase === 0 ? 1 : 0;
    setPhase(next);
    console.log(
      `[M3E] motion_play phase=${next} scheme=${scheme} reduceOverride=${reduceOverride} effectiveReduce=${String(reduceMotion)}`,
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>DAY 8 · MOTION</Text>
        <Text style={styles.title}>Springs</Text>
        <Text style={styles.meta}>
          Compose-exact analytic driver · twelve MotionScheme tokens · reduce-motion mapping
        </Text>

        <View style={styles.controls}>
          <View style={styles.segment}>
            {(['standard', 'expressive'] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                onPress={() => setScheme(value)}
                style={[styles.segmentItem, scheme === value && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, scheme === value && styles.segmentTextActive]}>
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={play} style={styles.play}>
            <Text style={styles.playText}>{phase === 0 ? 'Play springs' : 'Reverse'}</Text>
          </Pressable>
        </View>

        <View style={styles.controls}>
          <View style={styles.segment}>
            {(['system', 'on', 'off'] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                onPress={() => setReduceOverride(value)}
                style={[styles.segmentItem, reduceOverride === value && styles.segmentItemActive]}
              >
                <Text
                  style={[styles.segmentText, reduceOverride === value && styles.segmentTextActive]}
                >
                  {value === 'system' ? `system ${systemReduce ? 'on' : 'off'}` : value}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.reduceStatus}>
            {reduceMotion ? 'spatial instant · effects 100 ms fade' : 'full springs'}
          </Text>
        </View>

        <CurveChart />

        <Text style={styles.section}>Spatial · {scheme}</Text>
        {TOKENS.filter((entry) => entry.kind === 'spatial' && entry.scheme === scheme).map(
          (entry) => (
            <TokenRow
              key={`${entry.scheme}-${entry.token}`}
              entry={entry}
              phase={phase}
              scheme={scheme}
              reduceMotion={reduceMotion}
            />
          ),
        )}

        <Text style={styles.section}>Effects · {scheme}</Text>
        {TOKENS.filter((entry) => entry.kind === 'effects' && entry.scheme === scheme).map(
          (entry) => (
            <TokenRow
              key={`${entry.scheme}-${entry.token}`}
              entry={entry}
              phase={phase}
              scheme={scheme}
              reduceMotion={reduceMotion}
            />
          ),
        )}

        <DriverComparison phase={phase} reduceMotion={reduceMotion} scheme={scheme} />
        <ReduceMotionDemo phase={phase} reduceMotion={reduceMotion} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F1EA',
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 56,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#6B6257',
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#1C1A17',
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    color: '#6B6257',
    marginTop: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CAC2B7',
    overflow: 'hidden',
  },
  segmentItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  segmentItemActive: {
    backgroundColor: '#1C1A17',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A443C',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  play: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#6750A4',
  },
  playText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reduceStatus: {
    fontSize: 11,
    color: '#6B6257',
  },
  section: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1A17',
    marginTop: 26,
    marginBottom: 10,
  },
  tokenRow: {
    marginBottom: 14,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  tokenName: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1C1A17',
    flexShrink: 1,
  },
  tokenScheme: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tokenMeta: {
    fontSize: 10,
    color: '#6B6257',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 34,
    justifyContent: 'center',
  },
  trackBaseline: {
    height: 2,
    borderRadius: 1,
    backgroundColor: '#D8D0C5',
  },
  trackTarget: {
    position: 'absolute',
    top: 4,
    width: 2,
    height: 18,
    marginLeft: -1,
    backgroundColor: '#1C1A17',
  },
  marker: {
    position: 'absolute',
    top: 8,
    left: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  trackMetaRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackMeta: {
    fontSize: 8,
    color: '#9A9084',
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3DCD2',
    padding: 16,
    marginTop: 22,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1A17',
  },
  cardBody: {
    fontSize: 11,
    lineHeight: 16,
    color: '#6B6257',
    marginTop: 4,
    marginBottom: 10,
  },
  compareLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A443C',
    marginTop: 8,
  },
  chart: {
    marginTop: 4,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  axisText: {
    fontSize: 8,
    color: '#9A9084',
    fontVariant: ['tabular-nums'],
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  swatch: {
    width: 10,
    height: 4,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 9,
    color: '#6B6257',
    marginRight: 6,
  },
});
