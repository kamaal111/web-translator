import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useIntl, type IntlShape } from 'react-intl';
import toast from 'react-hot-toast';

import client from '@/api/client';
import { useConfigurations } from '@/context/use-configurations';
import { ResponseError } from '@/generated/api-client/src';
import commonMessages from '@/common/messages';
import messages from './message';

function handleLoginError(error: unknown, intl: IntlShape) {
  if (!(error instanceof ResponseError)) {
    toast.error(intl.formatMessage(commonMessages.unexpectedError));
    return;
  }

  const {
    response: { status },
    message,
  } = error;
  if (status >= 500) {
    toast.error(intl.formatMessage(messages.defaultLoginError));
    return;
  }

  toast.error(message);
}

export function useLogin() {
  const { isSuccess, isPending, mutate, error } = useMutation({ mutationFn: client.auth.login });

  const { fetchSession } = useConfigurations();
  const navigate = useNavigate();

  const intl = useIntl();

  React.useEffect(() => {
    if (isSuccess) {
      fetchSession().then(() => navigate('/'));
    }
  }, [isSuccess, navigate, fetchSession]);

  React.useEffect(() => {
    if (error != null) {
      handleLoginError(error, intl);
    }
  }, [error, intl]);

  return { result: { isLoading: isPending, isSuccess: isSuccess }, action: mutate };
}
