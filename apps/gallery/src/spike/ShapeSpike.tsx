import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

function useFrameStats(label: string): void {
  const stats = useSharedValue({ frames: 0, sum: 0, max: 0 });
  const log = (frames: number, sum: number, max: number) => {
    console.log(
      `M3E_SPIKE_UI ${label} frames=${frames} avg=${(sum / frames).toFixed(2)} max=${max.toFixed(2)}`,
    );
  };
  useFrameCallback((frame) => {
    'worklet';
    const delta = frame.timeSincePreviousFrame ?? 0;
    if (delta <= 0 || delta > 1000) {
      return;
    }
    const next = stats.value;
    next.frames += 1;
    next.sum += delta;
    if (delta > next.max) {
      next.max = delta;
    }
    if (next.frames % 120 === 0) {
      runOnJS(log)(next.frames, next.sum, next.max);
    }
  }, true);
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

export default function ShapeSpike({
  mode,
  renderer,
}: {
  mode: SpikeMode;
  renderer: SpikeRenderer;
}) {
  const pairs = useMorphPairs();
  useFrameStats(`${mode}/${renderer}`);
  useEffect(() => {
    console.log(`M3E_SPIKE_READY ${mode}/${renderer}`);
  }, [mode, renderer]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.kicker}>DAY 7 · PATH RENDERER SPIKE</Text>
        <Text style={styles.title}>
          {mode} · {renderer}
        </Text>
        <Text style={styles.meta}>
          {pairs === null ? 'building morph pairs…' : `${pairs.length} morph pairs ready`}
        </Text>
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
