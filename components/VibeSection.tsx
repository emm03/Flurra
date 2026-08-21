import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { vibes } from '@/data/mockData';
import {
  getHeavenlyRunRecommendations,
  type RunRecommendation,
  type VibeLabel,
} from '@/data/runRecommendations';
import { colors, fonts } from '@/theme';
import { SectionHeading } from './SectionHeading';
import { TopographicLines } from './TopographicLines';

export function VibeSection({ compact }: { compact: boolean }) {
  const [selectedVibes, setSelectedVibes] = useState<VibeLabel[]>(['Trees, please']);
  const [recommendations, setRecommendations] = useState<RunRecommendation[] | null>(null);
  const [savedRunIds, setSavedRunIds] = useState<string[]>([]);
  const [skiingRunId, setSkiingRunId] = useState<string | null>(null);
  const [expandedRunIds, setExpandedRunIds] = useState<string[]>([]);

  const toggleVibe = (vibe: VibeLabel) => {
    setSelectedVibes((current) =>
      current.includes(vibe) ? current.filter((item) => item !== vibe) : [...current, vibe],
    );
  };

  const reset = () => {
    setSelectedVibes([]);
    setRecommendations(null);
    setSavedRunIds([]);
    setSkiingRunId(null);
    setExpandedRunIds([]);
  };

  const findRuns = () => {
    if (!selectedVibes.length) return;
    setRecommendations(getHeavenlyRunRecommendations(selectedVibes));
  };

  const toggleListItem = (id: string, current: string[], update: (next: string[]) => void) => {
    update(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
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

        <View style={styles.panel}>
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
              <Text style={styles.resultsTitle}>Three runs for right now.</Text>
            </View>
            <Text style={styles.resultsMeta}>Based on {selectedVibes.join(' · ')}</Text>
          </View>
          <View style={[styles.resultsGrid, compact && styles.resultsGridMobile]}>
            {recommendations.map((run, index) => {
              const saved = savedRunIds.includes(run.id);
              const skiing = skiingRunId === run.id;
              const expanded = expandedRunIds.includes(run.id);
              return (
                <View key={run.id} style={[styles.runCard, compact && styles.runCardMobile]}>
                  <View style={styles.runTopline}>
                    <Text style={styles.runNumber}>0{index + 1}</Text>
                    <Text style={styles.confidence}>{run.confidence}% MATCH</Text>
                  </View>
                  <Text style={styles.runName}>{run.name}</Text>
                  <View style={styles.difficultyRow}>
                    <View style={styles.difficultyMark} />
                    <Text style={styles.difficulty}>{run.difficulty}</Text>
                  </View>
                  <Text style={styles.reason}>{run.reason}</Text>
                  <View style={styles.tags}>
                    {run.conditionTags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
                  </View>
                  {expanded ? <Text style={styles.details}>{run.details}</Text> : null}
                  <View style={styles.actions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => toggleListItem(run.id, expandedRunIds, setExpandedRunIds)}
                      style={({ hovered }: any) => [styles.actionSecondary, hovered && styles.actionHover]}
                    >
                      <Text style={styles.actionSecondaryText}>{expanded ? 'Close details' : 'View run'}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => toggleListItem(run.id, savedRunIds, setSavedRunIds)}
                      style={({ hovered }: any) => [styles.actionSecondary, saved && styles.actionSelected, hovered && styles.actionHover]}
                    >
                      <Feather name={saved ? 'check' : 'bookmark'} size={13} color={colors.forest} />
                      <Text style={styles.actionSecondaryText}>{saved ? 'Saved' : 'Save'}</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setSkiingRunId(skiing ? null : run.id)}
                    style={({ hovered }: any) => [styles.skiAction, skiing && styles.skiActionSelected, hovered && styles.skiActionHover]}
                  >
                    <Text style={[styles.skiActionText, skiing && styles.skiActionTextSelected]}>
                      {skiing ? '✓ ADDED TO MY DAY' : "I'M SKIING THIS"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
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
  panelHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 },
  panelEyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  selectedCount: { color: '#a9c0b9', fontFamily: fonts.body, fontSize: 10, marginTop: 5 },
  reset: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 7, borderBottomColor: colors.lime, borderBottomWidth: 1 },
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
  results: { alignSelf: 'center', maxWidth: 1160, width: '100%', paddingHorizontal: 28, marginTop: 80 },
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
  difficultyMark: { width: 9, height: 9, backgroundColor: colors.blue, transform: [{ rotate: '45deg' }] },
  difficulty: { color: colors.muted, fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  reason: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 17, minHeight: 58 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 15 },
  tag: { color: colors.forest, borderColor: '#bdc7bd', borderWidth: 1, fontFamily: fonts.bold, fontSize: 8, textTransform: 'uppercase', paddingVertical: 4, paddingHorizontal: 6 },
  details: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, borderTopColor: '#d7d6cc', borderTopWidth: 1, marginTop: 16, paddingTop: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 20 },
  actionSecondary: { flex: 1, minHeight: 36, borderColor: colors.forest, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 8 },
  actionSelected: { backgroundColor: colors.lime },
  actionHover: { borderColor: colors.orange },
  actionSecondaryText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 9, textTransform: 'uppercase', letterSpacing: .5 },
  skiAction: { backgroundColor: colors.forest, minHeight: 40, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  skiActionSelected: { backgroundColor: colors.lime },
  skiActionHover: { transform: [{ translateY: -1 }] },
  skiActionText: { color: colors.white, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
  skiActionTextSelected: { color: colors.deep },
});
