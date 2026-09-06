export type RunDetailOrigin = 'heavenly' | 'home';

export type RunDetailReturn = {
  label: 'Back to Heavenly' | 'Back to Flurra home';
  destination: '/' | '/resorts/heavenly';
  useHistory: boolean;
};

export function parseRunDetailOrigin(value: string | string[] | undefined): RunDetailOrigin | undefined {
  const origin = Array.isArray(value) ? value[0] : value;
  return origin === 'heavenly' || origin === 'home' ? origin : undefined;
}

export function getRunDetailReturn(
  origin: RunDetailOrigin | undefined,
  canGoBack: boolean,
): RunDetailReturn {
  if (origin === 'home') {
    return {
      label: 'Back to Flurra home',
      destination: '/',
      useHistory: canGoBack,
    };
  }

  if (origin === 'heavenly') {
    return {
      label: 'Back to Heavenly',
      destination: '/resorts/heavenly',
      useHistory: canGoBack,
    };
  }

  return {
    label: 'Back to Heavenly',
    destination: '/resorts/heavenly',
    useHistory: false,
  };
}
