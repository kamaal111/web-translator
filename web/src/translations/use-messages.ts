import React from 'react';
import { objects } from '@kamaalio/kamaal';

import { useConfigurations } from '@/data-providers/configurations-context';

type SupportedLocales = typeof SUPPORTED_LOCALES;
export type SupportedLocale = SupportedLocales[number];

type UseMEssagesReturnType = {
  messages: Record<string, string> | null;
  locale: SupportedLocale;
  defaultLocale: string;
};

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = [DEFAULT_LOCALE] as const;

function useMessages(): UseMEssagesReturnType {
  const [messages, setMessages] = React.useState<Record<string, string> | null>(null);

  const { context } = useConfigurations();

  const userLocale = context?.locale ?? DEFAULT_LOCALE;
  const locale = userLocale in SUPPORTED_LOCALES ? (userLocale as SupportedLocale) : DEFAULT_LOCALE;

  React.useEffect(() => {
    import(`./messages/${locale}.json`)
      .then(fetchedMessages => {
        const flattenMessages = objects.flatten<Record<string, string>>(fetchedMessages.default);
        setMessages(flattenMessages);
      })
      .catch(error => console.error(`Failed to load ${locale} message; error='${error}'`));
  }, [locale]);

  return { messages, locale, defaultLocale: DEFAULT_LOCALE };
}

export default useMessages;
