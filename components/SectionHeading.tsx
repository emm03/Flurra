import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

export function SectionHeading({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: string; light?: boolean }) {
  return <View style={styles.wrap}>
    <Text style={[styles.eyebrow, light && styles.light]}>{eyebrow}</Text>
    <Text style={[styles.title, light && styles.light]}>{title}</Text>
    {copy ? <Text style={[styles.copy, light && styles.lightMuted]}>{copy}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  wrap: { maxWidth: 610 }, eyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2.2, marginBottom: 12, textTransform: 'uppercase' },
  title: { color: colors.forest, fontFamily: fonts.display, fontSize: 42, lineHeight: 46, letterSpacing: -1.5 }, copy: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 25, marginTop: 12 }, light: { color: colors.white }, lightMuted: { color: '#d5dfda' },
});
