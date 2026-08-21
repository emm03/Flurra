import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

export function HeavenlyMap(_: { selectedRunId: string | null; onSelectRun: (runId: string) => void }) {
  return <View style={styles.fallback} accessibilityRole="alert">
    <Text style={styles.kicker}>WEB MAP PROTOTYPE</Text>
    <Text style={styles.title}>The interactive mountain map is currently available on web.</Text>
    <Text style={styles.copy}>The local OSM data is structured for a future MapLibre Native implementation.</Text>
  </View>;
}

const styles = StyleSheet.create({
  fallback: { minHeight: 420, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', padding: 35 },
  kicker: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.8 },
  title: { color: colors.forest, fontFamily: fonts.display, fontSize: 34, lineHeight: 39, textAlign: 'center', maxWidth: 650, marginTop: 10 },
  copy: { color: '#416259', fontFamily: fonts.body, fontSize: 13, lineHeight: 21, textAlign: 'center', maxWidth: 560, marginTop: 11 },
});
