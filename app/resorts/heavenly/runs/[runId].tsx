import { useLocalSearchParams } from 'expo-router';
import { RunDetailPage } from '@/components/resort/RunDetailPage';
import { getHeavenlyRun } from '@/data/heavenlyResort';

export default function HeavenlyRunPage() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  return <RunDetailPage run={getHeavenlyRun(runId)} />;
}
