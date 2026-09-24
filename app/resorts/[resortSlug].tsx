import { Redirect, useLocalSearchParams } from 'expo-router';
import { ResortPreviewPage } from '@/components/resort/ResortPreviewPage';
import { getResortBySlug, resortRegistry } from '@/data/resorts';

export function generateStaticParams() {
  return resortRegistry
    .filter((resort) => resort.id !== 'heavenly')
    .map((resort) => ({ resortSlug: resort.slug }));
}

export default function ResortRoute() {
  const { resortSlug } = useLocalSearchParams<{ resortSlug?: string | string[] }>();
  const resort = getResortBySlug(resortSlug);

  if (!resort || resort.id === 'heavenly') return <Redirect href="/" />;
  return <ResortPreviewPage resort={resort} />;
}
