import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CommunitySection } from '@/components/CommunitySection';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { ResortSection } from '@/components/ResortSection';
import { VibeSection } from '@/components/VibeSection';
import { colors } from '@/theme';

export default function HomePage() {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Fraunces_900Black });
  if (!loaded) return <View style={styles.loading}><ActivityIndicator color={colors.lime} /></View>;
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}><Hero compact={compact} /><VibeSection compact={compact} /><ResortSection compact={compact} /><CommunitySection compact={compact} /><Footer /></ScrollView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.forest }, content: { flexGrow: 1 }, loading: { flex: 1, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' } });
