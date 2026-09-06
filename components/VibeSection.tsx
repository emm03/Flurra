import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { vibes } from '@/data/mockData';
import {
  getHeavenlyRunRecommendations,
  type RunRecommendation,
  type VibeLabel,
} from '@/data/runRecommendations';
import { colors, fonts } from '@/theme';
import { useRunProgress } from '@/state/RunProgressStore';
import { SectionHeading } from './SectionHeading';
import { TopographicLines } from './TopographicLines';

export function VibeSection({ compact }: { compact: boolean }) {
  const router = useRouter();
  const [selectedVibes, setSelectedVibes] = useState<VibeLabel[]>(['Trees, please']);
  const [recommendations, setRecommendations] = useState<RunRecommendation[] | null>(null);
  const { isSaved, isCompleted, toggleSaved, toggleCompleted, persistenceStatus } = useRunProgress();

  const toggleVibe = (vibe: VibeLabel) => {
    setSelectedVibes((current) =>
      current.includes(vibe) ? current.filter((item) => item !== vibe) : [...current, vibe],
    );
  };

  const reset = () => {
    setSelectedVibes([]);
    setRecommendations(null);
  };

  const findRuns = () => {
    if (!selectedVibes.length) return;
    setRecommendations(getHeavenlyRunRecommendations(selectedVibes));
  };

  return (
    <View style={styles.section}>
      <TopographicLines />
      <View style={[styles.inner, compact && styles.mobile]}>
        <View style={styles.intro}>
          <View style={styles.number}><Text style={styles.numberText}>01</Text></View>
          <SectionHeading
            eyebrow="Match your mood"
            title={'What should I\nski next?'}
            copy="Tell us what kind of day you're having. Pick as many as you want — we'll point you toward the right side of the mountain."
          />
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>↝</Text>
            <Text style={styles.note}>NO ALGORITHM{`\n`}CAN FEEL YOUR LEGS</Text>
          </View>
        </View>

        <View style={[styles.panel, compact && styles.panelMobile]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>TODAY&apos;S VIBE</Text>
              <Text style={styles.selectedCount}>
                {selectedVibes.length} {selectedVibes.length === 1 ? 'vibe' : 'vibes'} selected
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset selected vibes"
              onPress={reset}
              style={({ hovered }: any) => [styles.reset, hovered && styles.resetHover]}
            >
              <Feather name="rotate-ccw" size={13} color={colors.lime} />
              <Text style={styles.resetText}>RESET</Text>
            </Pressable>
          </View>
          <Text style={styles.panelTitle}>I&apos;m in the mood for...</Text>
          <View style={styles.options}>
            {vibes.map((vibe) => {
              const active = selectedVibes.includes(vibe.label);
              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  key={vibe.label}
                  onPress={() => toggleVibe(vibe.label)}
                  style={({ pressed, hovered }: any) => [
                    styles.option,
                    active && styles.optionActive,
                    (pressed || hovered) && styles.optionHover,
                  ]}
                >
                  <Text style={styles.icon}>{vibe.icon}</Text>
                  <View style={styles.optionCopy}>
                    <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{vibe.label}</Text>
                    <Text style={[styles.optionSub, active && styles.optionSubActive]}>{vibe.sub}</Text>
                  </View>
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active ? <Feather name="check" size={12} color={colors.deep} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Find my next run"
            disabled={!selectedVibes.length}
            onPress={findRuns}
            style={({ hovered }: any) => [
              styles.find,
              !selectedVibes.length && styles.findDisabled,
              hovered && selectedVibes.length > 0 && styles.findHover,
            ]}
          >
            <Text style={styles.findText}>FIND MY NEXT RUN</Text>
            <Feather name="arrow-up-right" size={18} color={colors.white} />
          </Pressable>
          <Text style={styles.fine}>
            {selectedVibes.length ? 'Mock Heavenly recommendations · no live conditions yet.' : 'Choose at least one vibe to get recommendations.'}
          </Text>
        </View>
      </View>

      {recommendations ? (
        <View style={styles.results}>
          <View style={[styles.resultsHeading, compact && styles.resultsHeadingMobile]}>
            <View>
              <Text style={styles.resultsEyebrow}>YOUR HEAVENLY DAY</Text>
              <Text style={styles.resultsTitle}>Three runs for this sample day.</Text>
            </View>
            <Text style={styles.resultsMeta}>Based on {selectedVibes.join(' · ')}</Text>
          </View>
          <View style={[styles.resultsGrid, compact && styles.resultsGridMobile]}>
            {recommendations.map((run, index) => {
              const saved = isSaved(run.id);
              const skied = isCompleted(run.id);
              return (
                <View key={run.id} style={[styles.runCard, compact && styles.runCardMobile]}>
                  <View style={styles.runTopline}>
                    <Text style={styles.runNumber}>0{index + 1}</Text>
                    <Text style={styles.confidence}>{run.confidence}% MATCH</Text>
                  </View>
                  <Text style={styles.runName}>{run.name}</Text>
                  <View style={styles.difficultyRow}>
                    <Text style={[
                      styles.difficultyMark,
                      run.difficulty === 'Green circle' && styles.difficultyGreen,
                      run.difficulty === 'Blue square' && styles.difficultyBlue,
                    ]}>{run.difficulty === 'Green circle' ? '●' : run.difficulty === 'Blue square' ? '■' : run.difficulty === 'Double black diamond' ? '◆◆' : '◆'}</Text>
                    <Text style={styles.difficulty}>{run.difficulty}</Text>
                  </View>
                  <Text style={styles.reason}>{run.reason}</Text>
                  <View style={styles.tags}>
                    {run.conditionTags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
                  </View>
                  <Text style={styles.details}>{run.details}</Text>
                  <View style={styles.actions}>
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`View ${run.name} run details`}
                      onPress={() => router.push(`/resorts/heavenly/runs/${run.id}?from=home` as Href)}
                      style={({ hovered }: any) => [styles.actionSecondary, hovered && styles.actionHover]}
                    >
                      <Text style={styles.actionSecondaryText}>View run</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${saved ? 'Unsave' : 'Save'} ${run.name}`}
                      accessibilityState={{ selected: saved }}
                      onPress={() => toggleSaved(run.id)}
                      style={({ hovered }: any) => [styles.actionSecondary, saved && styles.actionSelected, hovered && styles.actionHover]}
                    >
                      <Feather name={saved ? 'check' : 'bookmark'} size={13} color={colors.forest} />
                      <Text style={styles.actionSecondaryText}>{saved ? 'Saved' : 'Save'}</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${skied ? 'Remove skied' : 'I skied'} ${run.name}`}
                    accessibilityState={{ selected: skied }}
                    onPress={() => toggleCompleted(run.id)}
                    style={({ hovered }: any) => [styles.skiAction, skied && styles.skiActionSelected, hovered && styles.skiActionHover]}
                  >
                    <Text style={[styles.skiActionText, skied && styles.skiActionTextSelected]}>
                      {skied ? '✓ ADDED TO MY PROGRESS' : 'I SKIED THIS'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.persistenceNote}>{persistenceStatus === 'unavailable' ? 'Run progress will last for this visit only because local storage is unavailable.' : 'Saved and completed runs stay on this device.'}</Text>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  section: { backgroundColor: colors.cream, paddingVertical: 110, overflow: 'hidden' },
  inner: { alignSelf: 'center', maxWidth: 1160, width: '100%', paddingHorizontal: 28, flexDirection: 'row', gap: 100, alignItems: 'center' },
  mobile: { flexDirection: 'column', gap: 55, paddingHorizontal: 20, alignItems: 'stretch' },
  intro: { flex: 1 },
  number: { backgroundColor: colors.orange, width: 45, height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginBottom: 30, transform: [{ rotate: '-7deg' }] },
  numberText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 12 },
  arrow: { marginTop: 35, transform: [{ rotate: '-5deg' }] },
  arrowText: { color: colors.orange, fontSize: 55 },
  note: { color: colors.forest, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.3, marginLeft: 80, marginTop: -22 },
  panel: { flex: 1.1, backgroundColor: colors.forest, padding: 35, borderRadius: 6, transform: [{ rotate: '1deg' }], shadowColor: '#14342b', shadowOpacity: .2, shadowRadius: 20, shadowOffset: { width: 8, height: 14 } },
  panelMobile: { padding: 20, transform: [{ rotate: '0deg' }] },
  panelHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 },
  panelEyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  selectedCount: { color: '#a9c0b9', fontFamily: fonts.body, fontSize: 10, marginTop: 5 },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 44, paddingHorizontal: 7, borderBottomColor: colors.lime, borderBottomWidth: 1 },
  resetHover: { backgroundColor: '#214c42' },
  resetText: { color: colors.lime, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.2 },
  panelTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 27, marginTop: 8, marginBottom: 22 },
  options: { gap: 9 },
  option: { backgroundColor: '#214c42', borderColor: '#3d655b', borderWidth: 1, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 4 },
  optionActive: { backgroundColor: colors.lime, borderColor: colors.lime, transform: [{ translateX: -7 }, { rotate: '-.6deg' }] },
  optionHover: { borderColor: colors.orange },
  icon: { fontSize: 24, width: 40 },
  optionCopy: { flex: 1 },
  optionTitle: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  optionTitleActive: { color: colors.deep },
  optionSub: { color: '#a9c0b9', fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  optionSubActive: { color: '#486057' },
  checkbox: { width: 18, height: 18, borderRadius: 3, borderColor: '#779088', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { borderColor: colors.deep },
  find: { backgroundColor: colors.orange, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, borderRadius: 3, marginTop: 20 },
  findDisabled: { opacity: 0.4 },
  findHover: { transform: [{ scale: 1.015 }] },
  findText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  fine: { color: '#809a92', fontFamily: fonts.body, fontSize: 9, textAlign: 'center', marginTop: 10 },
  results: { alignSelf: 'center', maxWidth: 1160, width: '100%', paddingHorizontal: 20, marginTop: 80 },
  resultsHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, borderBottomColor: colors.forest, borderBottomWidth: 2, paddingBottom: 18, marginBottom: 26 },
  resultsHeadingMobile: { flexDirection: 'column', alignItems: 'flex-start' },
  resultsEyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  resultsTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 36, lineHeight: 40, marginTop: 6 },
  resultsMeta: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11, maxWidth: 360, textAlign: 'right' },
  resultsGrid: { flexDirection: 'row', alignItems: 'stretch', gap: 18 },
  resultsGridMobile: { flexDirection: 'column' },
  runCard: { flex: 1, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, padding: 22, minWidth: 0, shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 6, height: 7 } },
  runCardMobile: { width: '100%' },
  runTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  runNumber: { color: colors.orange, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5 },
  confidence: { backgroundColor: colors.lime, color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1, paddingVertical: 5, paddingHorizontal: 7 },
  runName: { color: colors.forest, fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  difficultyRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 },
  difficultyMark: { color: colors.deep, fontFamily: fonts.bold, fontSize: 11 },
  difficultyGreen: { color: '#14834f' },
  difficultyBlue: { color: '#086fa9' },
  difficulty: { color: colors.muted, fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  reason: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 17, minHeight: 58 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 15 },
  tag: { color: colors.forest, borderColor: '#bdc7bd', borderWidth: 1, fontFamily: fonts.bold, fontSize: 8, textTransform: 'uppercase', paddingVertical: 4, paddingHorizontal: 6 },
  details: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, borderTopColor: '#d7d6cc', borderTopWidth: 1, marginTop: 16, paddingTop: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 20 },
  actionSecondary: { flex: 1, minHeight: 44, borderColor: colors.forest, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 8 },
  actionSelected: { backgroundColor: colors.lime },
  actionHover: { borderColor: colors.orange },
  actionSecondaryText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 9, textTransform: 'uppercase', letterSpacing: .5 },
  skiAction: { backgroundColor: colors.forest, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  skiActionSelected: { backgroundColor: colors.lime },
  skiActionHover: { transform: [{ translateY: -1 }] },
  skiActionText: { color: colors.white, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
  skiActionTextSelected: { color: colors.deep },
  persistenceNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 14 },
});
