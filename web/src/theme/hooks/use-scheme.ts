import React from 'react';

type GetRecordValues<T extends Record<string, unknown>> = T[keyof T];

export type Schema = GetRecordValues<typeof SCHEMAS>;

export const SCHEMAS = { LIGHT: 'light', DARK: 'dark' } as const;

function useScheme(initialSchema: Schema): Schema {
  const [matches, setMatches] = React.useState<Schema>(initialSchema);

  React.useEffect(() => {
    const media = window.matchMedia(`(prefers-color-scheme: ${SCHEMAS.DARK})`);

    const scheme = media.matches ? SCHEMAS.DARK : SCHEMAS.LIGHT;
    if (scheme !== matches) {
      setMatches(scheme);
    }

    function listener(event: MediaQueryListEvent): void {
      if (matches === (event.matches ? SCHEMAS.DARK : SCHEMAS.LIGHT)) return;

      setMatches(event.matches ? SCHEMAS.DARK : SCHEMAS.LIGHT);
    }

    media.addEventListener('change', listener);

    return () => {
      media.removeEventListener('change', listener);
    };
  }, [matches]);

  return matches;
}

export default useScheme;
