import { useLocalSearchParams } from 'expo-router';
import { RunDetailPage } from '@/components/resort/RunDetailPage';
import { getHeavenlyRun, heavenlyRuns } from '@/data/heavenlyResort';
import { parseRunDetailOrigin } from '@/navigation/runDetailReturn';

export function generateStaticParams() {
  return heavenlyRuns.map((run) => ({ runId: run.id }));
}

export default function HeavenlyRunPage() {
  const { runId, from } = useLocalSearchParams<{ runId: string; from?: string | string[] }>();
  return <RunDetailPage run={getHeavenlyRun(runId)} origin={parseRunDetailOrigin(from)} />;
}
