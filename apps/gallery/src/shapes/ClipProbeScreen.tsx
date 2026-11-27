/**
 * Day 7 `ForeignObject` probe. This is verification chrome, not a shipped
 * component. It exists to measure clipping, hit-testing, accessibility,
 * animation and scrolling behaviour of `ShapeContainer` on a real build.
 */

import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ShapeContainer } from 'react-native-material-expressive';

const SIZE = 300;

function logTap(zone: string, x: number, y: number) {
  console.log(`[M3E] clipprobe_tap zone=${zone} x=${x.toFixed(1)} y=${y.toFixed(1)}`);
}

function TapZone({ zone, style }: { zone: 'outside' | 'inside'; style: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityLabel={`Clip probe ${zone} path zone`}
      accessibilityRole="button"
      onPress={(event) => logTap(zone, event.nativeEvent.locationX, event.nativeEvent.locationY)}
      style={[styles.zone, style]}
      testID={`clipprobe-${zone}-zone`}
    >
      <Text style={styles.zoneText}>{zone}</Text>
    </Pressable>
  );
}

export default function ClipProbeScreen() {
  const dot = useSharedValue(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) {
      cancelAnimation(dot);
      dot.value = 0;
      return;
    }
    dot.value = withRepeat(withTiming(1, { duration: 1600 }), -1, true);
  }, [dot, running]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dot.value * 150 }],
  }));

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>DAY 7 · FOREIGN OBJECT PROBE</Text>
      <Text style={styles.title}>ShapeContainer clip</Text>
      <Text style={styles.meta}>
        Clover4Leaf, 300 dp. Tap the two zones; swipe the list; watch the dot.
      </Text>

      <View style={styles.host} testID="clipprobe-container">
        <ShapeContainer color="#FFF7E6" shape="Clover4Leaf" size={SIZE} testID="clipprobe-shape">
          <View style={styles.child} testID="clipprobe-child">
            <TapZone zone="outside" style={{ left: 8, top: 8 }} />
            <TapZone zone="inside" style={{ left: 120, top: 120 }} />
            <Animated.View style={[styles.dot, dotStyle]} testID="clipprobe-dot" />
            <ScrollView
              accessibilityLabel="Clip probe scrollable content"
              onScroll={(event) => {
                const y = event.nativeEvent.contentOffset.y;
                if (Math.round(y) % 20 === 0) {
                  console.log(`[M3E] clipprobe_scroll y=${y.toFixed(1)}`);
                }
              }}
              scrollEventThrottle={32}
              style={styles.scrollView}
              testID="clipprobe-scroll"
            >
              {Array.from({ length: 8 }, (_, index) => (
                <Text
                  accessibilityLabel={`Clip probe row ${index + 1}`}
                  key={index}
                  style={styles.row}
                >
                  Row {index + 1} · scrollable child
                </Text>
              ))}
            </ScrollView>
          </View>
        </ShapeContainer>
      </View>

      <Pressable
        accessibilityLabel={running ? 'Pause the animated dot' : 'Resume the animated dot'}
        accessibilityRole="button"
        onPress={() => setRunning((value) => !value)}
        style={styles.pause}
        testID="clipprobe-pause"
      >
        <Text style={styles.pauseText}>
          {running ? 'Pause motion (for a11y dump)' : 'Resume motion'}
        </Text>
      </Pressable>

      <Text style={styles.note}>
        Expected visual clip: the pale child background is hidden outside the clover. Expected RN
        limitation: hit-testing stays rectangular, so the “outside” zone may still receive the tap.
        Pause the dot before dumping the accessibility tree; animation and scrolling log to logcat.
      </Text>
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
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#6B6257',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#1C1A17',
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    color: '#6B6257',
    marginTop: 5,
  },
  host: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
    marginTop: 24,
  },
  child: {
    width: SIZE,
    height: SIZE,
    backgroundColor: '#CAC4D0',
  },
  zone: {
    position: 'absolute',
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6750A4',
    borderRadius: 8,
  },
  zoneText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  dot: {
    position: 'absolute',
    left: 26,
    top: 74,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#B3261E',
  },
  scrollView: {
    position: 'absolute',
    left: 70,
    right: 70,
    bottom: 8,
    height: 104,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  row: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 10,
    color: '#1C1A17',
  },
  pause: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#1C1A17',
  },
  pauseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  note: {
    fontSize: 11,
    lineHeight: 16,
    color: '#6B6257',
    marginTop: 14,
  },
});
