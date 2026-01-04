import React from 'react';
import z from 'zod';

import { getWindow } from '@/utils/window';

export type WebTranslatorContext = z.infer<typeof WebTranslatorContextSchema>;

type ConfigurationsState = [context: WebTranslatorContext | null, fetchSession: () => Promise<void>] | null;

type UseConfigurationsReturnType = {
  context: WebTranslatorContext | null;
  isLoggedIn: boolean;
  fetchSession: () => Promise<void>;
};

const WebTranslatorContextSchema = z.object({});

const ConfigurationsContext = React.createContext<ConfigurationsState>(null);

function ConfigurationsContextProvider({ children }: React.PropsWithChildren) {
  const window = getWindow();

  const [context, setContext] = React.useState<WebTranslatorContext | null>(() => {
    return WebTranslatorContextSchema.safeParse(window.WebTranslatorContext).data ?? null;
  });

  const fetchSession = React.useCallback(async () => {
    setContext({});
  }, []);

  React.useEffect(() => {
    let intervalID: number | null = null;
    if (context == null) {
      intervalID = setInterval(() => {
        if (window.WebTranslatorContext != null) {
          setContext(WebTranslatorContextSchema.parse(window.WebTranslatorContext));
          if (intervalID != null) {
            clearInterval(intervalID);
          }
        }
      }, 200);
    }

    return () => {
      if (intervalID != null) {
        clearInterval(intervalID);
      }
    };
  }, [window, context]);

  return (
    <ConfigurationsContext.Provider value={[context, fetchSession]}>
      {context != null ? children : null}
    </ConfigurationsContext.Provider>
  );
}

export function useConfigurations(): UseConfigurationsReturnType {
  const [context, fetchSession] = React.useContext(ConfigurationsContext) ?? [null, async () => {}];

  return {
    context,
    fetchSession,
    isLoggedIn: false,
  };
}

export default ConfigurationsContextProvider;
