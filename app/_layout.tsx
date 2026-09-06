import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { RunProgressProvider } from '@/state/RunProgressStore';
import { colors } from '@/theme';

export default function RootLayout() {
  const [iconsLoaded] = useFonts(Feather.font);
  if (!iconsLoaded) return <View style={styles.loading}><ActivityIndicator color={colors.lime} /></View>;

  return <RunProgressProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false }} /></RunProgressProvider>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
});
