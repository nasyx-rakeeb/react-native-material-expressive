import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO } from 'react-native-material-expressive';

import { scenes, type SceneId } from '../scenes.generated';
import type { RectLayer, Scene, TextLayer } from '../scene-types';

type FontProbeState = 'pending' | 'ok' | 'fallback';

const FONT_FAMILY = 'RobotoFlex';
const PROBE_TEXT = 'M3 Expressive wdth probe 0123456789';
// Compose expands a below-natural line height; React Native squashes it, so the
// scene renderer applies the same floor the library's type scale applies.
const LINE_HEIGHT_RATIO = ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO;

function isSceneId(value: string | null | undefined): value is SceneId {
  return typeof value === 'string' && value in scenes;
}

function parseSceneId(url: string | null | undefined): SceneId | null {
  if (!url) {
    return null;
  }
  const match = /[?&]name=([^&]+)/.exec(url);
  const name = match?.[1] ? decodeURIComponent(match[1]) : null;
  return isSceneId(name) ? name : null;
}

function RectView({ layer }: { layer: RectLayer }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        borderRadius: layer.radius,
        backgroundColor: layer.color,
        ...(layer.elevationDp > 0 ? { elevation: layer.elevationDp } : null),
      }}
    />
  );
}

function TextView({ layer }: { layer: TextLayer }) {
  const style: TextStyle = {
    position: 'absolute',
    left: layer.x,
    top: layer.y,
    color: layer.color,
    fontSize: layer.sizeSp,
    letterSpacing: layer.letterSpacingSp,
    fontFamily: FONT_FAMILY,
    fontVariationSettings: `'wght' ${layer.weight}`,
    includeFontPadding: false,
    textAlign: 'left',
    ...(layer.lineHeightSp !== undefined
      ? {
          lineHeight: Math.max(layer.lineHeightSp, layer.sizeSp * LINE_HEIGHT_RATIO),
        }
      : null),
    ...(layer.widthDp !== undefined ? { width: layer.widthDp } : null),
  };
  return (
    <Text
      allowFontScaling={false}
      onTextLayout={(event) => {
        const lines = event.nativeEvent.lines;
        const width = lines.length ? Math.max(...lines.map((line) => line.width)) : -1;
        const height = lines.reduce((sum, line) => sum + line.height, 0);
        console.log(
          `[M3E] scene_text_layout text=${JSON.stringify(layer.text)} width=${width} height=${height} lines=${lines.length}`,
        );
      }}
      style={style}
      testID={`scene-text-${layer.text}`}
    >
      {layer.text}
    </Text>
  );
}

function ProbeText({ width, onWidth }: { width: number; onWidth: (value: number) => void }) {
  return (
    <Text
      allowFontScaling={false}
      numberOfLines={1}
      onLayout={(event) => onWidth(event.nativeEvent.layout.width)}
      style={{
        position: 'absolute',
        left: -2000,
        top: 0,
        fontFamily: FONT_FAMILY,
        fontSize: 24,
        includeFontPadding: false,
        fontVariationSettings: `'wdth' ${width}`,
      }}
    >
      {PROBE_TEXT}
    </Text>
  );
}

function FontProbe({ onResult }: { onResult: (state: FontProbeState) => void }) {
  const widths = useRef<Record<number, number>>({});
  const reported = useRef(false);

  const handleWidth = useCallback(
    (axis: number, value: number) => {
      widths.current[axis] = value;
      const narrow = widths.current[25];
      const wide = widths.current[100];
      if (narrow === undefined || wide === undefined || reported.current) {
        return;
      }
      reported.current = true;
      const ok = Math.abs(narrow - wide) > 0.5;
      console.log(
        `[M3E] font_probe narrow=${narrow.toFixed(2)} wide=${wide.toFixed(2)} ok=${String(ok)}`,
      );
      onResult(ok ? 'ok' : 'fallback');
    },
    [onResult],
  );

  return (
    <View pointerEvents="none" style={styles.probeHost}>
      <ProbeText width={25} onWidth={(value) => handleWidth(25, value)} />
      <ProbeText width={100} onWidth={(value) => handleWidth(100, value)} />
    </View>
  );
}

function SceneBody({ scene }: { scene: Scene }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: scene.widthDp,
        height: scene.heightDp,
        backgroundColor: scene.background,
      }}
    >
      {scene.layers.map((layer, index) =>
        layer.type === 'rect' ? (
          <RectView key={`rect-${index}`} layer={layer} />
        ) : (
          <TextView key={`text-${index}`} layer={layer} />
        ),
      )}
    </View>
  );
}

export default function SceneHarness({ sceneId }: { sceneId: SceneId }) {
  const scene = scenes[sceneId] as Scene;
  const [fontState, setFontState] = useState<FontProbeState>('pending');
  const [renderKey, setRenderKey] = useState(0);
  const [readyKey, setReadyKey] = useState<number | null>(null);

  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        setReadyKey(renderKey);
        console.log(`[M3E] scene_ready scene=${sceneId} render=${renderKey}`);
      });
    });
    return () => {
      cancelAnimationFrame(first);
      if (second) {
        cancelAnimationFrame(second);
      }
    };
  }, [renderKey, sceneId]);

  const ready = readyKey === renderKey;

  const bandColor =
    fontState === 'fallback'
      ? '#FF8800'
      : fontState === 'pending' || !ready
        ? '#FF0000'
        : '#00FF00';

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <FontProbe onResult={setFontState} />
      <SceneBody key={`${sceneId}-${renderKey}`} scene={scene} />
      <View style={[styles.band, { backgroundColor: bandColor }]} />
      <Pressable
        accessibilityRole="button"
        onPress={() => setRenderKey((value) => value + 1)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Rerender</Text>
      </Pressable>
    </View>
  );
}

export function useHarnessScene(): SceneId | null | undefined {
  const [sceneId, setSceneId] = useState<SceneId | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    Linking.getInitialURL().then((url) => {
      if (mounted) {
        setSceneId(parseSceneId(url));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return sceneId;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  band: {
    position: 'absolute',
    left: 0,
    top: 220,
    width: 320,
    height: 24,
  },
  button: {
    position: 'absolute',
    left: 0,
    top: 260,
    width: 320,
    height: 44,
    backgroundColor: '#1D1B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  probeHost: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: 1,
    opacity: 0,
  },
});
