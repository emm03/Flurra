import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CommunitySection } from '@/components/CommunitySection';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { ResortSection } from '@/components/ResortSection';
import { VibeSection } from '@/components/VibeSection';
import { useSessionScrollRestoration } from '@/hooks/useSessionScrollRestoration';
import { colors } from '@/theme';

export default function HomePage() {
  const { width } = useWindowDimensions();
  const compact = width > 0 && width < 760;
  const sectionY = useRef({ vibe: 0, resorts: 0, reports: 0 });
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Fraunces_900Black });
  const { scrollRef, onScroll } = useSessionScrollRestoration('home', loaded);
  if (!loaded) return <View style={styles.loading}><ActivityIndicator color={colors.lime} /></View>;

  const scrollTo = (section: keyof typeof sectionY.current) => {
    scrollRef.current?.scrollTo({ y: sectionY.current[section], animated: true });
  };

  return <ScrollView ref={scrollRef} style={styles.page} contentContainerStyle={styles.content} onScroll={onScroll} scrollEventThrottle={32}>
    <Hero compact={compact} onExplore={() => scrollTo('resorts')} onVibe={() => scrollTo('vibe')} onMountainReport={() => scrollTo('reports')} onPlanSkiDay={() => scrollTo('vibe')} />
    <View onLayout={(event) => { sectionY.current.vibe = event.nativeEvent.layout.y; }}><VibeSection compact={compact} /></View>
    <View onLayout={(event) => { sectionY.current.resorts = event.nativeEvent.layout.y; }}><ResortSection compact={compact} /></View>
    <View onLayout={(event) => { sectionY.current.reports = event.nativeEvent.layout.y; }}><CommunitySection compact={compact} /></View>
    <Footer />
  </ScrollView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.forest }, content: { flexGrow: 1 }, loading: { flex: 1, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' } });
