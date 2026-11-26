import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Easing, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import {
  MATERIAL_SHAPE_NAMES,
  MorphingShape,
  Shape,
  ShapeContainer,
  type MaterialShapeName,
} from 'react-native-material-expressive';

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

const MORPH_PAIRS: readonly (readonly [MaterialShapeName, MaterialShapeName])[] = [
  ['Arch', 'Arrow'],
  ['Circle', 'Clover4Leaf'],
  ['Heart', 'Cookie9Sided'],
  ['Boom', 'Flower'],
  ['Pill', 'Diamond'],
];

function MorphRow({
  index,
  from,
  to,
}: {
  index: number;
  from: MaterialShapeName;
  to: MaterialShapeName;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      index * 180,
      withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [index, progress]);

  return (
    <View style={styles.morphRow}>
      <MorphingShape
        from={from}
        to={to}
        progress={progress}
        size={64}
        color={PALETTE[index % 10]}
      />
      <View style={styles.morphLabels}>
        <Text style={styles.morphName}>
          {from} → {to}
        </Text>
        <Text style={styles.morphMeta}>spring-safe progress · overshoot preserved</Text>
      </View>
    </View>
  );
}

function ClippedDemo() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  return (
    <View style={styles.clipDemo}>
      <ShapeContainer from="Arch" to="Clover4Leaf" progress={progress} size={180}>
        <View style={styles.clipContent}>
          <View style={[styles.clipBand, { backgroundColor: '#6750A4' }]} />
          <View style={[styles.clipBand, { backgroundColor: '#B3261E' }]} />
          <View style={[styles.clipBand, { backgroundColor: '#00639B' }]} />
          <Text style={styles.clipText}>CLIPPED</Text>
        </View>
      </ShapeContainer>
      <Text style={styles.clipMeta}>
        ShapeContainer · ForeignObject clip{'\n'}visual clipping only; touches stay rectangular
      </Text>
    </View>
  );
}

export default function ShapeGallery() {
  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>DAY 7 · SHAPE GALLERY</Text>
        <Text style={styles.title}>Material shapes</Text>
        <Text style={styles.meta}>
          35 shapes · geometry verified against Compose Material3 1.5.0 within 1e-4
        </Text>

        <View style={styles.grid}>
          {MATERIAL_SHAPE_NAMES.map((name, index) => (
            <View key={name} style={styles.cell}>
              <Shape shape={name} size={52} color={PALETTE[index % PALETTE.length]} />
              <Text style={styles.cellLabel}>{name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Morphs</Text>
        {MORPH_PAIRS.map(([from, to], index) => (
          <MorphRow key={`${from}-${to}`} index={index} from={from} to={to} />
        ))}

        <Text style={styles.section}>Clipped content</Text>
        <ClippedDemo />
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#6B6257',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#1C1A17',
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    color: '#6B6257',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
    marginHorizontal: -4,
  },
  cell: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  cellLabel: {
    fontSize: 8,
    lineHeight: 11,
    color: '#6B6257',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1A17',
    marginTop: 22,
    marginBottom: 12,
  },
  morphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  morphLabels: {
    flex: 1,
  },
  morphName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1A17',
  },
  morphMeta: {
    fontSize: 10,
    lineHeight: 14,
    color: '#6B6257',
    marginTop: 2,
  },
  clipDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clipContent: {
    width: 180,
    height: 180,
    backgroundColor: '#FFF7E6',
  },
  clipBand: {
    height: 60,
  },
  clipText: {
    position: 'absolute',
    left: 12,
    top: 76,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clipMeta: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 14,
    color: '#6B6257',
  },
});
