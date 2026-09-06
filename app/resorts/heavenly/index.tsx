import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Footer } from '@/components/Footer';
import { HeavenlyMapWorkspace } from '@/components/resort/HeavenlyMapWorkspace';
import { MountainPulse } from '@/components/resort/MountainPulse';
import { ResortHero } from '@/components/resort/ResortHero';
import {
  communityPhotos,
  heavenlyResort,
  heavenlyRuns,
  mountainReports,
  mountainSkiers,
  skiGroups,
} from '@/data/heavenlyResort';
import { heavenlyVerifiedRunIds } from '@/data/heavenlyMap';
import { useSessionScrollRestoration } from '@/hooks/useSessionScrollRestoration';
import { useRunProgress } from '@/state/RunProgressStore';
import { colors } from '@/theme';

export default function HeavenlyPage() {
  const router = useRouter();
  const { run: requestedRunParam } = useLocalSearchParams<{ run?: string | string[] }>();
  const requestedRunId = Array.isArray(requestedRunParam) ? requestedRunParam[0] : requestedRunParam;
  const { width } = useWindowDimensions();
  const compact = width > 0 && width < 760;
  const mapSectionRef = useRef<View>(null);
  const [selectedMapRunId, setSelectedMapRunId] = useState<string | null>(null);
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Fraunces_900Black });
  const { savedRunIds, completedRunIds, toggleSaved, toggleCompleted } = useRunProgress();
  const { scrollRef, scrollOffsetRef, onScroll } = useSessionScrollRestoration(
    'resorts/heavenly',
    loaded,
    Boolean(requestedRunId),
  );

  const scrollToMap = useCallback(() => {
    mapSectionRef.current?.measureInWindow((_x, y) => {
      scrollRef.current?.scrollTo({ y: Math.max(0, scrollOffsetRef.current + y - 12), animated: true });
    });
  }, [scrollOffsetRef, scrollRef]);

  const selectMapRun = (runId: string | null) => {
    setSelectedMapRunId(runId);
    router.setParams({ run: runId ?? undefined });
  };

  const showRunOnMap = (runId: string) => {
    if (!heavenlyVerifiedRunIds.has(runId)) return;
    selectMapRun(runId);
    setTimeout(scrollToMap, 50);
  };

  useEffect(() => {
    if (!requestedRunId || !heavenlyVerifiedRunIds.has(requestedRunId)) return;
    setSelectedMapRunId(requestedRunId);
    const timeout = setTimeout(scrollToMap, 160);
    return () => clearTimeout(timeout);
  }, [requestedRunId, scrollToMap]);

  if (!loaded) return <View style={styles.loading}><ActivityIndicator color={colors.lime} /></View>;

  const progress = Math.min(100, Math.round((completedRunIds.length / heavenlyRuns.length) * 100));

  return <ScrollView
    ref={scrollRef}
    style={styles.page}
    contentContainerStyle={styles.content}
    scrollEventThrottle={16}
    onScroll={onScroll}
  >
    <ResortHero
      {...heavenlyResort}
      compact={compact}
      completedCount={completedRunIds.length}
      savedCount={savedRunIds.length}
      explorationProgress={progress}
      onFindRun={scrollToMap}
    />
    <View ref={mapSectionRef}>
      <HeavenlyMapWorkspace
        resortName={heavenlyResort.name}
        compact={compact}
        runs={heavenlyRuns}
        selectedRunId={selectedMapRunId}
        savedIds={savedRunIds}
        skiedIds={completedRunIds}
        mapRunIds={heavenlyVerifiedRunIds}
        onSelectRun={selectMapRun}
        onToggleSaved={toggleSaved}
        onToggleSkied={toggleCompleted}
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
