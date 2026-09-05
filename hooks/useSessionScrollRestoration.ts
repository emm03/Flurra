import { useCallback, useEffect, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

const STORAGE_PREFIX = 'flurra:scroll:';

export function useSessionScrollRestoration(
  routeKey: string,
  ready: boolean,
  skipRestore = false,
) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!ready || skipRestore || restoredRef.current || typeof window === 'undefined') return;
    restoredRef.current = true;
    let storedOffset = 0;
    try {
      storedOffset = Number(window.sessionStorage.getItem(`${STORAGE_PREFIX}${routeKey}`)) || 0;
    } catch {
      return;
    }
    if (storedOffset <= 0) return;
    const timeout = window.setTimeout(() => {
      scrollOffsetRef.current = storedOffset;
      scrollRef.current?.scrollTo({ y: storedOffset, animated: false });
    }, 50);
    return () => window.clearTimeout(timeout);
  }, [ready, routeKey, skipRestore]);

  useEffect(() => () => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        `${STORAGE_PREFIX}${routeKey}`,
        String(Math.max(0, Math.round(scrollOffsetRef.current))),
      );
    } catch {
      // Scroll restoration is a progressive enhancement.
    }
  }, [routeKey]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  return { scrollRef, scrollOffsetRef, onScroll };
}
