import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Footer } from '@/components/Footer';
import { FutureMapSection } from '@/components/resort/FutureMapSection';
import { MountainPulse } from '@/components/resort/MountainPulse';
import { ResortHero } from '@/components/resort/ResortHero';
import { RunDirectory } from '@/components/resort/RunDirectory';
import {
  communityPhotos,
  heavenlyResort,
  heavenlyRuns,
  mountainReports,
  mountainSkiers,
  skiGroups,
} from '@/data/heavenlyResort';
import { heavenlyVerifiedRunIds } from '@/data/heavenlyMap';
import { colors } from '@/theme';

export default function HeavenlyPage() {
  const { run: requestedRunParam } = useLocalSearchParams<{ run?: string | string[] }>();
  const { width } = useWindowDimensions();
  const compact = width > 0 && width < 760;
  const scrollRef = useRef<ScrollView>(null);
  const directoryY = useRef(0);
  const mapSectionRef = useRef<View>(null);
  const scrollOffsetY = useRef(0);
  const [selectedMapRunId, setSelectedMapRunId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(['powderbowl-woods']);
  const [skiedIds, setSkiedIds] = useState<string[]>(['maggies', 'orion', 'ridge-run']);
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Fraunces_900Black });

  const scrollToMap = () => {
    mapSectionRef.current?.measureInWindow((_x, y) => {
      scrollRef.current?.scrollTo({ y: Math.max(0, scrollOffsetY.current + y - 12), animated: true });
    });
  };

  const showRunOnMap = (runId: string) => {
    if (!heavenlyVerifiedRunIds.has(runId)) return;
    setSelectedMapRunId(runId);
    setTimeout(scrollToMap, 50);
  };

  useEffect(() => {
    const requestedRunId = Array.isArray(requestedRunParam) ? requestedRunParam[0] : requestedRunParam;
    if (!requestedRunId || !heavenlyVerifiedRunIds.has(requestedRunId)) return;
    setSelectedMapRunId(requestedRunId);
    const timeout = setTimeout(scrollToMap, 160);
    return () => clearTimeout(timeout);
  }, [requestedRunParam]);

  if (!loaded) return <View style={styles.loading}><ActivityIndicator color={colors.lime} /></View>;

  const toggle = (id: string, current: string[], update: (next: string[]) => void) => {
    update(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const progress = Math.round((skiedIds.length / heavenlyRuns.length) * 100);

  return <ScrollView
    ref={scrollRef}
    style={styles.page}
    contentContainerStyle={styles.content}
    scrollEventThrottle={16}
    onScroll={(event) => { scrollOffsetY.current = event.nativeEvent.contentOffset.y; }}
  >
    <ResortHero
      {...heavenlyResort}
      compact={compact}
      completedCount={skiedIds.length}
      savedCount={savedIds.length}
      explorationProgress={progress}
      onFindRun={() => scrollRef.current?.scrollTo({ y: directoryY.current || 760, animated: true })}
    />
    <View ref={mapSectionRef}>
      <FutureMapSection
        resortName={heavenlyResort.name}
        compact={compact}
        runs={heavenlyRuns}
        selectedRunId={selectedMapRunId}
        onSelectRun={setSelectedMapRunId}
      />
    </View>
    <View onLayout={(event) => { directoryY.current = event.nativeEvent.layout.y; }}>
      <RunDirectory
        runs={heavenlyRuns}
        compact={compact}
        savedIds={savedIds}
        skiedIds={skiedIds}
        mapRunIds={heavenlyVerifiedRunIds}
        onToggleSaved={(id) => toggle(id, savedIds, setSavedIds)}
        onToggleSkied={(id) => toggle(id, skiedIds, setSkiedIds)}
        onShowOnMap={showRunOnMap}
      />
    </View>
    <MountainPulse reports={mountainReports} skiers={mountainSkiers} groups={skiGroups} photos={communityPhotos} compact={compact} />
    <Footer />
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.forest },
  content: { flexGrow: 1 },
  loading: { flex: 1, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
});
