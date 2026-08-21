import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

type HeaderProps = {
  compact: boolean;
  onExplore: () => void;
  onVibe: () => void;
  onMountainReport: () => void;
  onPlanSkiDay: () => void;
};

export function Header({ compact, onExplore, onVibe, onMountainReport, onPlanSkiDay }: HeaderProps) {
  return <View style={styles.header}>
    <View style={styles.brand}><View style={styles.snow}><Text style={styles.snowText}>✳</Text></View><Text style={styles.logo}>flurra</Text></View>
    {compact ? <Pressable style={styles.menu}><Feather name="menu" size={22} color={colors.white} /></Pressable> : <>
      <View style={styles.nav}>
        <Pressable accessibilityRole="button" onPress={onExplore}><Text style={styles.active}>EXPLORE</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onVibe}><Text style={styles.link}>THE VIBE</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onMountainReport}><Text style={styles.link}>MOUNTAIN REPORT</Text></Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={onPlanSkiDay} style={({ hovered }: any) => [styles.dayButton, hovered && styles.dayHover]}><Text style={styles.dayText}>PLAN A SKI DAY</Text><Feather name="arrow-up-right" size={16} color={colors.deep} /></Pressable>
    </>}
  </View>;
}
const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 1240, width: '100%', alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  brand: { alignItems: 'center', flexDirection: 'row', gap: 9 }, snow: { backgroundColor: colors.lime, width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] }, snowText: { color: colors.deep, fontSize: 20, fontWeight: '900' }, logo: { color: colors.white, fontFamily: fonts.display, fontSize: 30, letterSpacing: -1.5 },
  nav: { flexDirection: 'row', gap: 32, alignItems: 'center' }, link: { color: '#d7e3dd', fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 }, active: { color: colors.lime, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  dayButton: { backgroundColor: colors.lime, borderRadius: 4, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', gap: 8, alignItems: 'center', transform: [{ rotate: '-1deg' }] }, dayHover: { transform: [{ rotate: '1deg' }, { scale: 1.02 }] }, dayText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 }, menu: { borderColor: '#55756c', borderWidth: 1, padding: 9, borderRadius: 4 },
});
