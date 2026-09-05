import { useLocalSearchParams } from 'expo-router';
import { RunDetailPage } from '@/components/resort/RunDetailPage';
import { getHeavenlyRun, heavenlyRuns } from '@/data/heavenlyResort';

export function generateStaticParams() {
  return heavenlyRuns.map((run) => ({ runId: run.id }));
}

export default function HeavenlyRunPage() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  return <RunDetailPage run={getHeavenlyRun(runId)} />;
}
