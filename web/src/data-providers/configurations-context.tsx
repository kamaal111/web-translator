import React from 'react';
import z from 'zod';
import { useIntl } from 'react-intl';

import { getWindow } from '@/utils/window';
import apiClient from '@/api/client';
import { ResponseError } from '@/generated/api-client/src/runtime';
import toast from 'react-hot-toast';
import messages from '@/common/messages';
import type { SessionResponse } from '@/generated/api-client/src';

export type WebTranslatorContext = z.infer<typeof WebTranslatorContextSchema>;

type ConfigurationsState = [context: WebTranslatorContext | null, fetchSession: () => Promise<void>] | null;

type UseConfigurationsReturnType = {
  context: WebTranslatorContext | null;
  isLoggedIn: boolean;
  fetchSession: () => Promise<void>;
};

const WebTranslatorContextSchema = z.object({ locale: z.string().min(2).nullish() });

const ConfigurationsContext = React.createContext<ConfigurationsState>(null);

function ConfigurationsContextProvider({ children }: React.PropsWithChildren) {
  const window = getWindow();

  const [context, setContext] = React.useState<WebTranslatorContext | null>(() => {
    return WebTranslatorContextSchema.safeParse(window.WebTranslatorContext).data ?? null;
  });

  const intl = useIntl();

  const fetchSession = React.useCallback(async (): Promise<void> => {
    let session: SessionResponse;
    try {
      session = await apiClient.auth.getSession();
    } catch (error) {
      if (!(error instanceof ResponseError)) {
        toast.error(intl.formatMessage(messages.unexpectedError));
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
          toast.error(intl.formatMessage(messages.unexpectedError));
          break;
      }

      return;
    }

    setContext({ locale: session?.user.locale });
  }, [intl]);

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
