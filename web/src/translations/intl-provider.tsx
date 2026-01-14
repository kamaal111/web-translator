import type React from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';

import useMessages from './use-messages';

type IntlProviderProps = React.PropsWithChildren;

const IntlProvider: React.FC<IntlProviderProps> = ({ children }) => {
  const { messages, locale, defaultLocale } = useMessages();

  if (messages == null) return null;

  return (
    <ReactIntlProvider locale={locale} messages={messages} defaultLocale={defaultLocale}>
      {children}
    </ReactIntlProvider>
  );
};

export default IntlProvider;
