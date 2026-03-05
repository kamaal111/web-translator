import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useIntl, type IntlShape } from 'react-intl';
import toast from 'react-hot-toast';

import client from '@/api/client';
import { useConfigurations } from '@/context/use-configurations';
import messages from './message';

function useLogin() {
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
      handleLoginError(intl);
    }
  }, [error, intl]);

  return { result: { isLoading: isPending, isSuccess: isSuccess }, action: mutate };
}

function handleLoginError(intl: IntlShape) {
  toast.error(intl.formatMessage(messages.defaultLoginError));
}

export default useLogin;
