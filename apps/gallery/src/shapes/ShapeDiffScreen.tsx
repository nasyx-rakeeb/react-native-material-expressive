import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MATERIAL_SHAPE_NAMES, Shape } from 'react-native-material-expressive';

/**
 * Static 35-shape grid for the Day 7 raster diff against Compose.
 *
 * Layout contract (must match ShapeGridActivity.kt): 5 columns x 7 rows,
 * 64dp shapes on a 72dp pitch, starting at (0, 0) on a white background,
 * system bars hidden.
 */
export default function ShapeDiffScreen() {
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        console.log('M3E_SHAPES_READY');
      });
    });
    return () => {
      cancelAnimationFrame(first);
      if (second) {
        cancelAnimationFrame(second);
      }
    };
  }, []);

  return (
    <View style={styles.root} testID="shape-grid">
      <StatusBar hidden />
      {MATERIAL_SHAPE_NAMES.map((name, index) => (
        <View
          key={name}
          style={[
            styles.cell,
            {
              left: (index % 5) * 72,
              top: Math.floor(index / 5) * 72,
            },
          ]}
        >
          <Shape shape={name} size={64} color="#6750A4" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cell: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
});
