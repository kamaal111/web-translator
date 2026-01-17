import type React from 'react';
import { Toaster, type DefaultToastOptions } from 'react-hot-toast';
import { Theme, type ThemeProps } from '@radix-ui/themes';

import useScheme, { SCHEMAS, type Schema } from './hooks/use-scheme';

const INITIAL_SCHEMA: Schema = SCHEMAS.LIGHT;

const THEME: ThemeProps = {
  accentColor: 'indigo',
  grayColor: 'sand',
  radius: 'large',
  scaling: '95%',
};

const TOAST_OPTIONS: DefaultToastOptions = {
  error: {
    duration: 3000,
    style: { background: '#DD2712', color: '#ffffff' },
  },
};

function ThemeProvider({ children }: React.PropsWithChildren) {
  const schema = useScheme(INITIAL_SCHEMA);

  return (
    <Theme {...THEME} appearance={schema}>
      {children}
      <Toaster toastOptions={TOAST_OPTIONS} />
    </Theme>
  );
}

export default ThemeProvider;
