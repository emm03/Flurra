import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  const runMobileAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return <View style={styles.header}>
    <View style={styles.brand}><View style={styles.snow}><Text style={styles.snowText}>✳</Text></View><Text style={styles.logo}>flurra</Text></View>
    {compact ? <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        accessibilityState={{ expanded: menuOpen }}
        onPress={() => setMenuOpen((current) => !current)}
        style={({ pressed }: any) => [styles.menu, pressed && styles.menuPressed]}
      >
        <Feather name={menuOpen ? 'x' : 'menu'} size={22} color={colors.white} />
      </Pressable>
      {menuOpen ? <View style={styles.mobileNav} accessibilityRole="menu">
        <Pressable accessibilityRole="menuitem" onPress={() => runMobileAction(onExplore)} style={styles.mobileNavItem}><Text style={styles.mobileNavActive}>EXPLORE</Text></Pressable>
        <Pressable accessibilityRole="menuitem" onPress={() => runMobileAction(onVibe)} style={styles.mobileNavItem}><Text style={styles.mobileNavText}>THE VIBE</Text></Pressable>
        <Pressable accessibilityRole="menuitem" onPress={() => runMobileAction(onMountainReport)} style={styles.mobileNavItem}><Text style={styles.mobileNavText}>MOUNTAIN REPORT</Text></Pressable>
        <Pressable accessibilityRole="menuitem" onPress={() => runMobileAction(onPlanSkiDay)} style={[styles.mobileNavItem, styles.mobileDayButton]}><Text style={styles.mobileDayText}>PLAN A SKI DAY</Text><Feather name="arrow-down" size={16} color={colors.deep} /></Pressable>
      </View> : null}
    </> : <>
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
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 1240, width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 14, position: 'relative', zIndex: 20 },
  brand: { alignItems: 'center', flexDirection: 'row', gap: 9 }, snow: { backgroundColor: colors.lime, width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] }, snowText: { color: colors.deep, fontSize: 20, fontWeight: '900' }, logo: { color: colors.white, fontFamily: fonts.display, fontSize: 30, letterSpacing: -1.5 },
  nav: { flexDirection: 'row', gap: 32, alignItems: 'center' }, link: { color: '#d7e3dd', fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 }, active: { color: colors.lime, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  dayButton: { backgroundColor: colors.lime, borderRadius: 4, paddingHorizontal: 18, paddingVertical: 12, minHeight: 44, flexDirection: 'row', gap: 8, alignItems: 'center', transform: [{ rotate: '-1deg' }] }, dayHover: { transform: [{ rotate: '1deg' }, { scale: 1.02 }] }, dayText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
  menu: { borderColor: '#55756c', borderWidth: 1, width: 44, height: 44, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  menuPressed: { backgroundColor: '#214c42' },
  mobileNav: { position: 'absolute', top: 66, left: 16, right: 16, backgroundColor: colors.deep, borderColor: '#55756c', borderWidth: 1, padding: 8, shadowColor: '#000', shadowOpacity: .3, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
  mobileNavItem: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: '#31534b', borderBottomWidth: 1 },
  mobileNavText: { color: colors.white, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2 },
  mobileNavActive: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2 },
  mobileDayButton: { backgroundColor: colors.lime, marginTop: 8, borderBottomWidth: 0 },
  mobileDayText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1 },
});
