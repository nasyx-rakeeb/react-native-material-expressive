import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  PACKAGE_NAME,
  getDynamicColorSchemes,
  isDynamicColorAvailable,
} from 'react-native-material-expressive';

import SceneHarness, { useHarnessScene } from './src/harness/SceneHarness';
import ShapeSpike from './src/spike/ShapeSpike';

/**
 * Verification probe only. Set at bundle time:
 *   EXPO_PUBLIC_M3E_DYNAMIC_PROBE=1 ./gradlew :app:assembleRelease
 * The committed colour evidence was captured with the probe enabled.
 */
const DYNAMIC_PROBE_ENABLED = process.env.EXPO_PUBLIC_M3E_DYNAMIC_PROBE === '1';

export default function App() {
  const route = useHarnessScene();

  useEffect(() => {
    if (!DYNAMIC_PROBE_ENABLED || Platform.OS !== 'android') {
      return;
    }
    console.log(`M3E_DYNAMIC_AVAILABLE ${isDynamicColorAvailable()}`);
    void getDynamicColorSchemes().then((schemes) => {
      console.log(`M3E_DYNAMIC_PAYLOAD ${JSON.stringify(schemes)}`);
    });
  }, []);

  if (route === undefined) {
    return <View style={styles.boot} />;
  }

  if (route.spike !== null) {
    return <ShapeSpike mode={route.spike} renderer={route.renderer} />;
  }

  if (route.sceneId !== null) {
    return <SceneHarness sceneId={route.sceneId} textComp={route.textComp} />;
  }

  return <Home />;
}

function Home() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <Text style={styles.kicker}>DAY 1 · BOOT CHECK</Text>
          <Text style={styles.title}>
            Material 3{'\n'}
            Expressive
          </Text>
          <Text style={styles.body}>
            <Text style={styles.mono}>{PACKAGE_NAME}</Text> is wired into this Expo workspace.
          </Text>
          <Text style={styles.meta}>
            {Platform.OS} · Expo SDK 58 · React Native 0.88.1 · New Architecture
          </Text>
          <View style={styles.rule} />
          <Text style={styles.note}>
            No components yet. The gallery catalog starts once the foundation gate is met.
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  root: {
    flex: 1,
    backgroundColor: '#F5F1EA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 2.4,
    fontWeight: '700',
    color: '#6B6257',
    marginBottom: 18,
  },
  title: {
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -1.8,
    fontWeight: '800',
    color: '#1C1A17',
    marginBottom: 24,
  },
  body: {
    fontSize: 18,
    lineHeight: 27,
    color: '#3A352E',
    marginBottom: 18,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 16,
  },
  meta: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B6257',
    marginBottom: 28,
  },
  rule: {
    height: 1,
    backgroundColor: '#D8D0C4',
    marginBottom: 24,
  },
  note: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B6257',
    maxWidth: 420,
  },
});
