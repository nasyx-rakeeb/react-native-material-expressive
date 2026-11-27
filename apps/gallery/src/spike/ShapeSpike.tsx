import { useEffect, useMemo, useState } from 'react';
import {
  PixelRatio,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  ClipPath,
  Defs,
  ForeignObject,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import {
  Canvas,
  Group,
  LinearGradient as SkiaLinearGradient,
  Path as SkiaPath,
  Skia,
  vec,
} from 'react-native-skia';
import {
  geometryToSvgPath,
  interpolateGeometry,
  MATERIAL_SHAPE_NAMES,
  MaterialShapes,
  Morph,
  morphToGeometries,
  polygonToGeometry,
  type PathGeometry,
} from 'react-native-material-expressive';

export type SpikeMode = 'cycle' | 'concurrent' | 'clip' | 'clipchildren' | 'grid';
export type SpikeRenderer = 'svg' | 'skia';

interface MorphPair {
  start: PathGeometry;
  end: PathGeometry;
}

const AnimatedSvgPath = Animated.createAnimatedComponent(Path);

const PALETTE = [
  '#6750A4',
  '#7D5260',
  '#B3261E',
  '#006A6A',
  '#7A5900',
  '#386A20',
  '#00639B',
  '#8B5000',
  '#4F5B92',
  '#984061',
];

function buildPairs(): MorphPair[] {
  const pairs: MorphPair[] = [];
  for (let index = 0; index < MATERIAL_SHAPE_NAMES.length; index++) {
    const from = MaterialShapes[MATERIAL_SHAPE_NAMES[index]!];
    const to = MaterialShapes[MATERIAL_SHAPE_NAMES[(index + 1) % MATERIAL_SHAPE_NAMES.length]!];
    pairs.push(morphToGeometries(new Morph(from, to)));
  }
  return pairs;
}

function useMorphPairs(): MorphPair[] | null {
  const [pairs, setPairs] = useState<MorphPair[] | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setPairs(buildPairs()), 0);
    return () => clearTimeout(timer);
  }, []);
  return pairs;
}

interface FrameStats {
  frames: number;
  avg: number;
  max: number;
  fps: number;
}

const EMPTY_FRAME_STATS: FrameStats = { frames: 0, avg: 0, max: 0, fps: 0 };

function FrameStatsCard({ label }: { label: string }) {
  const [display, setDisplay] = useState<FrameStats>(EMPTY_FRAME_STATS);
  const stats = useSharedValue({ frames: 0, sum: 0, max: 0 });
  const window = useWindowDimensions();
  const density = PixelRatio.get();
  const pixelWidth = Math.round(PixelRatio.getPixelSizeForLayoutSize(window.width));
  const pixelHeight = Math.round(PixelRatio.getPixelSizeForLayoutSize(window.height));
  const fps = display.frames > 0 ? display.fps : 0;

  const publish = (frames: number, sum: number, max: number) => {
    const avg = sum / frames;
    setDisplay({ frames, avg, max, fps: 1000 / avg });
    console.log(
      `M3E_SPIKE_UI ${label} frames=${frames} avg=${avg.toFixed(2)} max=${max.toFixed(2)}`,
    );
  };

  useFrameCallback((frame) => {
    'worklet';
    const delta = frame.timeSincePreviousFrame ?? 0;
    if (delta <= 0 || delta > 1000) {
      return;
    }
    const current = stats.value;
    const next = {
      frames: current.frames + 1,
      sum: current.sum + delta,
      max: delta > current.max ? delta : current.max,
    };
    stats.value = next;
    // 1 Hz keeps the readout readable without re-rendering the spike tree.
    if (next.frames % 60 === 0) {
      runOnJS(publish)(next.frames, next.sum, next.max);
    }
  }, true);

  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsFps}>{fps > 0 ? fps.toFixed(1) : '—'} FPS</Text>
      <Text style={styles.statsLine}>
        avg {display.frames ? display.avg.toFixed(2) : '—'} ms · max{' '}
        {display.frames ? display.max.toFixed(2) : '—'} ms
      </Text>
      <Text style={styles.statsLine}>
        {display.frames} frames · {Math.round(window.width)}×{Math.round(window.height)} dp ·{' '}
        {pixelWidth}×{pixelHeight} px · {density.toFixed(3)}× · {Platform.OS}{' '}
        {String(Platform.Version)}
      </Text>
      <Text style={styles.statsHint}>
        Let it run ≥18 s per mode. Read this card before reporting the device model, SoC and refresh
        rate. max includes launch/scheduling spikes.
      </Text>
    </View>
  );
}

function SvgMorph({
  pair,
  progress,
  size,
  fill,
}: {
  pair: MorphPair;
  progress: { value: number };
  size: number;
  fill: string;
}) {
  const animatedProps = useAnimatedProps(() => ({
    d: geometryToSvgPath(interpolateGeometry(pair.start, pair.end, progress.value), size, size),
  }));
  return <AnimatedSvgPath animatedProps={animatedProps} fill={fill} />;
}

function SkiaMorph({
  pair,
  progress,
  size,
  fill,
}: {
  pair: MorphPair;
  progress: { value: number };
  size: number;
  fill: string;
}) {
  const path = useDerivedValue(() => {
    const geometry = interpolateGeometry(pair.start, pair.end, progress.value);
    const next = Skia.PathBuilder.Make();
    next.moveTo(geometry[0]! * size, geometry[1]! * size);
    for (let index = 0; index < geometry.length; index += 8) {
      next.cubicTo(
        geometry[index + 2]! * size,
        geometry[index + 3]! * size,
        geometry[index + 4]! * size,
        geometry[index + 5]! * size,
        geometry[index + 6]! * size,
        geometry[index + 7]! * size,
      );
    }
    next.close();
    return next.detach();
  });
  return <SkiaPath path={path} color={fill} />;
}

function useCycleProgress(duration: number) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(MATERIAL_SHAPE_NAMES.length, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, progress]);
  return progress;
}

function useCycleGeometry(pairs: MorphPair[]) {
  const progress = useCycleProgress(42_000);
  return useDerivedValue(() => {
    const value = progress.value;
    const segment = Math.min(pairs.length - 1, Math.floor(value));
    const local = value - segment;
    const pair = pairs[segment]!;
    return interpolateGeometry(pair.start, pair.end, local);
  });
}

function SvgCycle({ pairs }: { pairs: MorphPair[] }) {
  const geometry = useCycleGeometry(pairs);
  const size = 300;
  const animatedProps = useAnimatedProps(() => ({
    d: geometryToSvgPath(geometry.value, size, size),
  }));
  return (
    <Svg width={size} height={size}>
      <AnimatedSvgPath animatedProps={animatedProps} fill={PALETTE[0]} />
    </Svg>
  );
}

function SkiaCycle({ pairs }: { pairs: MorphPair[] }) {
  const geometry = useCycleGeometry(pairs);
  const size = 300;
  const path = useDerivedValue(() => {
    const points = geometry.value;
    const next = Skia.PathBuilder.Make();
    next.moveTo(points[0]! * size, points[1]! * size);
    for (let index = 0; index < points.length; index += 8) {
      next.cubicTo(
        points[index + 2]! * size,
        points[index + 3]! * size,
        points[index + 4]! * size,
        points[index + 5]! * size,
        points[index + 6]! * size,
        points[index + 7]! * size,
      );
    }
    next.close();
    return next.detach();
  });
  return (
    <Canvas style={{ width: size, height: size }}>
      <SkiaPath path={path} color={PALETTE[0]} />
    </Canvas>
  );
}

function CycleSpike({ pairs, renderer }: { pairs: MorphPair[]; renderer: SpikeRenderer }) {
  return renderer === 'svg' ? <SvgCycle pairs={pairs} /> : <SkiaCycle pairs={pairs} />;
}

function ConcurrentCell({
  pair,
  index,
  renderer,
}: {
  pair: MorphPair;
  index: number;
  renderer: SpikeRenderer;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      index * 120,
      withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [index, progress]);
  const size = 96;
  if (renderer === 'svg') {
    return (
      <Svg width={size} height={size}>
        <SvgMorph
          pair={pair}
          progress={progress}
          size={size}
          fill={PALETTE[index % PALETTE.length]!}
        />
      </Svg>
    );
  }
  return (
    <Canvas style={{ width: size, height: size }}>
      <SkiaMorph
        pair={pair}
        progress={progress}
        size={size}
        fill={PALETTE[index % PALETTE.length]!}
      />
    </Canvas>
  );
}

function ConcurrentSpike({ pairs, renderer }: { pairs: MorphPair[]; renderer: SpikeRenderer }) {
  return (
    <View style={styles.concurrentGrid}>
      {pairs.slice(0, 10).map((pair, index) => (
        <ConcurrentCell key={index} pair={pair} index={index} renderer={renderer} />
      ))}
    </View>
  );
}

function useClipProgress() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);
  return progress;
}

function SvgClip({ pair }: { pair: MorphPair }) {
  const progress = useClipProgress();
  const size = 320;
  const animatedProps = useAnimatedProps(() => ({
    d: geometryToSvgPath(interpolateGeometry(pair.start, pair.end, progress.value), size, size),
  }));
  return (
    <Svg width={size} height={size}>
      <Defs>
        <ClipPath id="morph-clip">
          <AnimatedSvgPath animatedProps={animatedProps} />
        </ClipPath>
        <LinearGradient id="morph-fill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#6750A4" />
          <Stop offset="0.5" stopColor="#B3261E" />
          <Stop offset="1" stopColor="#00639B" />
        </LinearGradient>
      </Defs>
      <G clipPath="url(#morph-clip)">
        <Rect x={0} y={0} width={size} height={size} fill="url(#morph-fill)" />
      </G>
    </Svg>
  );
}

function SkiaClip({ pair }: { pair: MorphPair }) {
  const progress = useClipProgress();
  const size = 320;
  const path = useDerivedValue(() => {
    const geometry = interpolateGeometry(pair.start, pair.end, progress.value);
    const next = Skia.PathBuilder.Make();
    next.moveTo(geometry[0]! * size, geometry[1]! * size);
    for (let index = 0; index < geometry.length; index += 8) {
      next.cubicTo(
        geometry[index + 2]! * size,
        geometry[index + 3]! * size,
        geometry[index + 4]! * size,
        geometry[index + 5]! * size,
        geometry[index + 6]! * size,
        geometry[index + 7]! * size,
      );
    }
    next.close();
    return next.detach();
  });
  return (
    <Canvas style={{ width: size, height: size }}>
      <Group clip={path}>
        <SkiaPath path={`M0 0H${size}V${size}H0Z`} color="#6750A4">
          <SkiaLinearGradient
            start={vec(0, 0)}
            end={vec(size, size)}
            colors={['#6750A4', '#B3261E', '#00639B']}
          />
        </SkiaPath>
      </Group>
    </Canvas>
  );
}

function ClipSpike({ pair, renderer }: { pair: MorphPair; renderer: SpikeRenderer }) {
  return renderer === 'svg' ? <SvgClip pair={pair} /> : <SkiaClip pair={pair} />;
}

function SvgClipChildren({ pair }: { pair: MorphPair }) {
  const progress = useClipProgress();
  const size = 320;
  const animatedProps = useAnimatedProps(() => ({
    d: geometryToSvgPath(interpolateGeometry(pair.start, pair.end, progress.value), size, size),
  }));
  return (
    <Svg width={size} height={size}>
      <Defs>
        <ClipPath id="morph-children-clip">
          <AnimatedSvgPath animatedProps={animatedProps} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#morph-children-clip)">
        <ForeignObject x={0} y={0} width={size} height={size}>
          <View style={styles.clipChildren}>
            <View style={[styles.clipBand, { backgroundColor: '#6750A4' }]} />
            <View style={[styles.clipBand, { backgroundColor: '#B3261E' }]} />
            <View style={[styles.clipBand, { backgroundColor: '#00639B' }]} />
            <Text style={styles.clipLabel}>CLIPPED RN CHILDREN</Text>
          </View>
        </ForeignObject>
      </G>
    </Svg>
  );
}

function SkiaClipChildren({ pair }: { pair: MorphPair }) {
  const progress = useClipProgress();
  const size = 320;
  const path = useDerivedValue(() => {
    const geometry = interpolateGeometry(pair.start, pair.end, progress.value);
    const next = Skia.PathBuilder.Make();
    next.moveTo(geometry[0]! * size, geometry[1]! * size);
    for (let index = 0; index < geometry.length; index += 8) {
      next.cubicTo(
        geometry[index + 2]! * size,
        geometry[index + 3]! * size,
        geometry[index + 4]! * size,
        geometry[index + 5]! * size,
        geometry[index + 6]! * size,
        geometry[index + 7]! * size,
      );
    }
    next.close();
    return next.detach();
  });
  return (
    <View style={styles.clipChildrenHost}>
      <Canvas style={{ width: size, height: size }}>
        <Group clip={path}>
          <SkiaPath path="M0 0H320V107H0Z" color="#6750A4" />
          <SkiaPath path="M0 107H320V214H0Z" color="#B3261E" />
          <SkiaPath path="M0 214H320V320H0Z" color="#00639B" />
        </Group>
      </Canvas>
      <Text style={styles.clipNote}>
        Skia clips Skia content only; RN children cannot be clipped.
      </Text>
    </View>
  );
}

function ClipChildrenSpike({ pair, renderer }: { pair: MorphPair; renderer: SpikeRenderer }) {
  return renderer === 'svg' ? <SvgClipChildren pair={pair} /> : <SkiaClipChildren pair={pair} />;
}

function GridSpike({ renderer }: { renderer: SpikeRenderer }) {
  const geometries = useMemo(
    () => MATERIAL_SHAPE_NAMES.map((name) => polygonToGeometry(MaterialShapes[name])),
    [],
  );
  const cell = 64;
  const gap = 8;
  const columns = 5;
  const rows = Math.ceil(geometries.length / columns);
  const width = columns * cell + (columns - 1) * gap;
  const height = rows * cell + (rows - 1) * gap;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {renderer === 'svg' ? (
        <Svg width={width} height={height}>
          {geometries.map((geometry, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            return (
              <Path
                key={MATERIAL_SHAPE_NAMES[index]}
                d={geometryToSvgPath(geometry, cell, cell)}
                fill={PALETTE[index % PALETTE.length]}
                transform={`translate(${column * (cell + gap)}, ${row * (cell + gap)})`}
              />
            );
          })}
        </Svg>
      ) : (
        <Canvas style={{ width, height }}>
          {geometries.map((geometry, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            return (
              <Group
                key={MATERIAL_SHAPE_NAMES[index]}
                transform={[
                  { translateX: column * (cell + gap) },
                  { translateY: row * (cell + gap) },
                ]}
              >
                <SkiaPath
                  path={geometryToSvgPath(geometry, cell, cell)}
                  color={PALETTE[index % PALETTE.length]}
                />
              </Group>
            );
          })}
        </Canvas>
      )}
      <View style={styles.legend}>
        {MATERIAL_SHAPE_NAMES.map((name) => (
          <Text key={name} style={styles.legendText}>
            {name}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const SPIKE_MODES: readonly SpikeMode[] = ['cycle', 'concurrent', 'clip', 'clipchildren', 'grid'];
const SPIKE_RENDERERS: readonly SpikeRenderer[] = ['svg', 'skia'];

export default function ShapeSpike({
  mode: initialMode,
  renderer: initialRenderer,
}: {
  mode: SpikeMode;
  renderer: SpikeRenderer;
}) {
  const [mode, setMode] = useState<SpikeMode>(initialMode);
  const [renderer, setRenderer] = useState<SpikeRenderer>(initialRenderer);
  const pairs = useMorphPairs();

  useEffect(() => {
    console.log(`M3E_SPIKE_READY ${mode}/${renderer}`);
  }, [mode, renderer]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.kicker}>DAY 7 · PATH RENDERER SPIKE · U-29</Text>
        <Text style={styles.title}>
          {mode} · {renderer}
        </Text>
        <Text style={styles.meta}>
          {pairs === null ? 'building morph pairs…' : `${pairs.length} morph pairs ready`}
        </Text>
      </View>

      <FrameStatsCard key={`${mode}/${renderer}`} label={`${mode}/${renderer}`} />

      <View style={styles.controls}>
        <View style={styles.segment}>
          {SPIKE_MODES.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === value }}
              onPress={() => setMode(value)}
              style={[styles.segmentItem, mode === value && styles.segmentItemActive]}
            >
              <Text
                style={[styles.segmentText, mode === value && styles.segmentTextActive]}
                numberOfLines={1}
              >
                {value === 'clipchildren' ? 'clip kids' : value}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.segment}>
          {SPIKE_RENDERERS.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: renderer === value }}
              onPress={() => setRenderer(value)}
              style={[styles.segmentItem, renderer === value && styles.segmentItemActive]}
            >
              <Text style={[styles.segmentText, renderer === value && styles.segmentTextActive]}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.stage}>
        {pairs === null ? null : mode === 'cycle' ? (
          <CycleSpike pairs={pairs} renderer={renderer} />
        ) : mode === 'concurrent' ? (
          <ConcurrentSpike pairs={pairs} renderer={renderer} />
        ) : mode === 'clip' ? (
          <ClipSpike pair={pairs[0]!} renderer={renderer} />
        ) : mode === 'clipchildren' ? (
          <ClipChildrenSpike pair={pairs[0]!} renderer={renderer} />
        ) : (
          <GridSpike renderer={renderer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F1EA',
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 16,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#6B6257',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#1C1A17',
  },
  meta: {
    fontSize: 13,
    color: '#6B6257',
    marginTop: 6,
  },
  statsCard: {
    backgroundColor: '#1C1A17',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  statsFps: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statsLine: {
    color: '#E3DCD2',
    fontSize: 11,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  statsHint: {
    color: '#A79D90',
    fontSize: 9,
    lineHeight: 12,
    marginTop: 5,
  },
  controls: {
    gap: 6,
    marginBottom: 8,
  },
  segment: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CAC2B7',
    overflow: 'hidden',
  },
  segmentItem: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  segmentItemActive: {
    backgroundColor: '#6750A4',
  },
  segmentText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4A443C',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concurrentGrid: {
    width: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  clipChildren: {
    width: 320,
    height: 320,
    backgroundColor: '#FFF7E6',
  },
  clipBand: {
    height: 106,
  },
  clipLabel: {
    position: 'absolute',
    left: 16,
    top: 140,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clipChildrenHost: {
    alignItems: 'center',
    gap: 12,
  },
  clipNote: {
    fontSize: 11,
    lineHeight: 15,
    color: '#6B6257',
    textAlign: 'center',
    maxWidth: 320,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 16,
    width: 360,
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 9,
    color: '#6B6257',
    width: 68,
  },
});
