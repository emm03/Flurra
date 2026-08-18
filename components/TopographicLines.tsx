import { StyleSheet, View } from 'react-native';

export function TopographicLines({ light = false }: { light?: boolean }) {
  const color = light ? 'rgba(255,255,255,.12)' : 'rgba(18,60,50,.10)';
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {[0, 1, 2, 3, 4].map((i) => <View key={i} style={[styles.ring, { borderColor: color, width: 240 + i * 85, height: 100 + i * 52, top: 20 + i * 13, right: -90 - i * 18, transform: [{ rotate: `${-10 + i * 2}deg` }] }]} />)}
  </View>;
}
const styles = StyleSheet.create({ ring: { position: 'absolute', borderWidth: 1.5, borderRadius: '50%' } });
