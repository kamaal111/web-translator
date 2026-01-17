import React from 'react';
import { useIntl } from 'react-intl';

import { getWindow } from '@/utils/window';
import apiClient from '@/api/client';
import { ResponseError } from '@/generated/api-client/src/runtime';
import toast from 'react-hot-toast';
import messages from '@/common/messages';
import type { SessionResponse } from '@/generated/api-client/src';
import { ConfigurationsContext } from './use-configurations';
import { WebTranslatorContextSchema, type WebTranslatorContext } from './schemas';

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

export default ConfigurationsContextProvider;
