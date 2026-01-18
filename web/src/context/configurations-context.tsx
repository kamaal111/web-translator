import React from 'react';
import toast from 'react-hot-toast';

import { getWindow } from '@/utils/window';
import apiClient from '@/api/client';
import { ResponseError } from '@/generated/api-client/src/runtime';
import type { SessionResponse } from '@/generated/api-client/src';
import { ConfigurationsContext } from './use-configurations';
import { WebTranslatorContextSchema, type WebTranslatorContext } from './schemas';

export type ConfigurationsContextProviderProps = React.PropsWithChildren<{ context?: WebTranslatorContext }>;

function ConfigurationsContextProvider({ children, context: defaultContext }: ConfigurationsContextProviderProps) {
  const window = getWindow();

  const [context, setContext] = React.useState<WebTranslatorContext | null>(() => {
    return defaultContext ?? WebTranslatorContextSchema.safeParse(window.WebTranslatorContext).data ?? null;
  });

  const fetchSession = React.useCallback(async (): Promise<void> => {
    let session: SessionResponse;
    try {
      session = await apiClient.auth.getSession();
    } catch (error) {
      if (!(error instanceof ResponseError)) {
        toast.error('Something went wrong');
        return;
      }

      switch (error.response.status) {
        case 404:
          document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          });
          break;
        default:
          toast.error('Something went wrong');
          break;
      }

      return;
    }

    setContext({ locale: session?.user.locale, current_user: session.user });
  }, []);

  React.useEffect(() => {
    let intervalID: ReturnType<typeof setInterval> | null = null;
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

export default ConfigurationsContextProvider;
