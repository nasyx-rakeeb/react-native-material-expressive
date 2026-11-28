import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Linking,
  PixelRatio,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  FocusRing,
  MaterialSymbol,
  Ripple,
  ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO,
  StateLayer,
  Surface,
  type MaterialSymbolName,
} from 'react-native-material-expressive';

import { scenes, type SceneId } from '../scenes.generated';
import type { IconLayer, InteractionLayer, RectLayer, Scene, TextLayer } from '../scene-types';
import {
  TEXT_COMPENSATIONS,
  type TextCompOverride,
  type TextCompStrategy,
} from './text-compensation.generated';

type FontProbeState = 'pending' | 'ok' | 'fallback';

export type SpikeMode = 'cycle' | 'concurrent' | 'clip' | 'clipchildren' | 'grid';
export type SpikeRenderer = 'svg' | 'skia';
export type MotionDemoScheme = 'standard' | 'expressive';
export type MotionDemoReduce = 'system' | 'on' | 'off';

export interface HarnessRoute {
  sceneId: SceneId | null;
  textComp: TextCompStrategy;
  fontScaling: boolean;
  spike: SpikeMode | null;
  renderer: SpikeRenderer;
  screen: 'shapes' | 'shapesdiff' | 'clipprobe' | 'motion' | 'foundation' | null;
  motionScheme: MotionDemoScheme;
  motionReduce: MotionDemoReduce;
}

const FONT_FAMILY = 'RobotoFlex';
const PROBE_TEXT = 'M3 Expressive wdth probe 0123456789';
const DENSITY = PixelRatio.get();

/**
 * Compose lays out at integer pixels: a 36 dp height at 2.625× becomes 95 px,
 * not 94.5. Yoga rounds the same size down, which leaves a 1 px edge on every
 * fractional-dp scene layer. Snapping the harness bounds to the pixel grid
 * makes both stacks render the same rectangle; it does not change the library,
 * which still takes dp.
 */
function snapDp(value: number): number {
  return Math.round(value * DENSITY) / DENSITY;
}
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

function parseTextComp(url: string | null | undefined): TextCompStrategy {
  const match = /[?&]textComp=([^&]+)/.exec(url ?? '');
  const value = match?.[1];
  return value === 'c1' || value === 'c2' || value === 'c3' || value === 'c4' ? value : 'none';
}

function parseFontScaling(url: string | null | undefined): boolean {
  return /[?&]fontScaling=1(?:&|$)/.test(url ?? '');
}

function parseSpike(url: string | null | undefined): SpikeMode | null {
  const match = /[?&]spike=([^&]+)/.exec(url ?? '');
  const value = match?.[1];
  return value === 'cycle' ||
    value === 'concurrent' ||
    value === 'clip' ||
    value === 'clipchildren' ||
    value === 'grid'
    ? value
    : null;
}

function parseRenderer(url: string | null | undefined): SpikeRenderer {
  return /[?&]renderer=skia(?:&|$)/.test(url ?? '') ? 'skia' : 'svg';
}

function parseScreen(
  url: string | null | undefined,
): 'shapes' | 'shapesdiff' | 'clipprobe' | 'motion' | 'foundation' | null {
  if (/[?&]screen=foundation(?:&|$)/.test(url ?? '')) {
    return 'foundation';
  }
  if (/[?&]screen=shapesdiff(?:&|$)/.test(url ?? '')) {
    return 'shapesdiff';
  }
  if (/[?&]screen=clipprobe(?:&|$)/.test(url ?? '')) {
    return 'clipprobe';
  }
  if (/[?&]screen=motion(?:&|$)/.test(url ?? '')) {
    return 'motion';
  }
  return /[?&]screen=shapes(?:&|$)/.test(url ?? '') ? 'shapes' : null;
}

function parseMotionScheme(url: string | null | undefined): MotionDemoScheme {
  return /[?&]scheme=standard(?:&|$)/.test(url ?? '') ? 'standard' : 'expressive';
}

function parseMotionReduce(url: string | null | undefined): MotionDemoReduce {
  if (/[?&]reduce=on(?:&|$)/.test(url ?? '')) {
    return 'on';
  }
  if (/[?&]reduce=off(?:&|$)/.test(url ?? '')) {
    return 'off';
  }
  return 'system';
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

function TextView({
  layer,
  override,
  fontScaling,
}: {
  layer: TextLayer;
  override?: TextCompOverride;
  fontScaling: boolean;
}) {
  const sizeSp = override?.sizeSp ?? layer.sizeSp;
  const letterSpacingSp = override?.letterSpacingSp ?? layer.letterSpacingSp;
  const lineHeightSp = override?.lineHeightSp ?? layer.lineHeightSp;
  const style: TextStyle = {
    position: 'absolute',
    left: layer.x,
    top: layer.y,
    color: layer.color,
    fontSize: sizeSp,
    letterSpacing: letterSpacingSp,
    fontFamily: FONT_FAMILY,
    fontVariationSettings: `'wght' ${layer.weight}`,
    includeFontPadding: false,
    textAlign: 'left',
    ...(lineHeightSp !== undefined
      ? {
          lineHeight: Math.max(lineHeightSp, sizeSp * LINE_HEIGHT_RATIO),
        }
      : null),
    ...(layer.widthDp !== undefined ? { width: layer.widthDp } : null),
  };
  return (
    <Text
      allowFontScaling={fontScaling}
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

function InteractionView({ layer }: { layer: InteractionLayer }) {
  const width = snapDp(layer.width);
  const height = snapDp(layer.height);
  const showStateLayer =
    layer.focusRing === null &&
    layer.ripple === null &&
    layer.state !== 'default' &&
    layer.state !== 'disabled';
  return (
    <Surface
      color={layer.containerColor}
      shape={layer.radius}
      shadowElevation={layer.elevationDp}
      style={{
        position: 'absolute',
        left: snapDp(layer.x),
        top: snapDp(layer.y),
        width,
        height,
      }}
      tonalElevation={layer.elevationDp}
    >
      {showStateLayer ? (
        <StateLayer borderRadius={layer.radius} color={layer.contentColor} state={layer.state} />
      ) : null}
      {layer.ripple !== null ? (
        <Ripple
          active
          borderRadius={layer.radius}
          bounded={layer.ripple.bounded}
          color={layer.contentColor}
          height={height}
          origin={{ x: layer.ripple.originX, y: layer.ripple.originY }}
          progress={layer.ripple.progress}
          width={width}
        />
      ) : null}
      {layer.focusRing !== null ? (
        <FocusRing
          innerColor={layer.focusRing.innerColor}
          outerColor={layer.focusRing.outerColor}
          progress={1}
          radius={layer.radius}
          visible
        />
      ) : null}
    </Surface>
  );
}

function IconView({ layer }: { layer: IconLayer }) {
  return (
    <MaterialSymbol
      color={layer.color}
      fill={layer.fill}
      grade={layer.grade}
      name={layer.name as MaterialSymbolName}
      opticalSize={layer.opticalSize}
      size={layer.size}
      style={{
        position: 'absolute',
        left: snapDp(layer.x),
        top: snapDp(layer.y),
      }}
      weight={layer.weight}
    />
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

function SceneBody({
  scene,
  textComp,
  fontScaling,
}: {
  scene: Scene;
  textComp: TextCompStrategy;
  fontScaling: boolean;
}) {
  const override = TEXT_COMPENSATIONS[textComp][scene.id];
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
      {scene.layers.map((layer, index) => {
        if (layer.type === 'rect') {
          return <RectView key={`rect-${index}`} layer={layer} />;
        }
        if (layer.type === 'text') {
          return (
            <TextView
              key={`text-${index}`}
              layer={layer}
              override={override}
              fontScaling={fontScaling}
            />
          );
        }
        if (layer.type === 'icon') {
          return <IconView key={`icon-${index}`} layer={layer} />;
        }
        return <InteractionView key={`interaction-${index}`} layer={layer} />;
      })}
    </View>
  );
}

export default function SceneHarness({
  sceneId,
  textComp = 'none',
  fontScaling = false,
}: {
  sceneId: SceneId;
  textComp?: TextCompStrategy;
  fontScaling?: boolean;
}) {
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
      <SceneBody
        key={`${sceneId}-${renderKey}`}
        scene={scene}
        textComp={textComp}
        fontScaling={fontScaling}
      />
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

export function useHarnessScene(): HarnessRoute | undefined {
  const [route, setRoute] = useState<HarnessRoute | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    Linking.getInitialURL().then((url) => {
      if (mounted) {
        setRoute({
          sceneId: parseSceneId(url),
          textComp: parseTextComp(url),
          fontScaling: parseFontScaling(url),
          spike: parseSpike(url),
          renderer: parseRenderer(url),
          screen: parseScreen(url),
          motionScheme: parseMotionScheme(url),
          motionReduce: parseMotionReduce(url),
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return route;
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
