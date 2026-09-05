import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [iconsLoaded] = useFonts(Feather.font);
  if (!iconsLoaded) return null;

  return <><StatusBar style="light" /><Stack screenOptions={{ headerShown: false }} /></>;
}
