import { EmailPasswordSignInPayloadSchema } from '@wt/schemas';

import { useLogin } from '@/auth/hooks/use-login';
import type { FormField } from '@/common/components/form/form';
import Form from '@/common/components/form/form';
import type { EmailPasswordSignIn } from '@/generated/api-client/src';
import messages from './messages';

function LoginSubForm() {
  const {
    action: login,
    result: { isLoading },
  } = useLogin();

  const fields: Array<FormField<keyof EmailPasswordSignIn>> = [
    {
      id: 'email',
      placeholder: 'jane@mail.com',
      invalidMessage: messages.emailFieldInvalidMessage,
      type: 'email',
      autoComplete: 'username',
      label: messages.emailFieldLabel,
    },
    {
      id: 'password',
      placeholder: 'password',
      invalidMessage: messages.passwordFieldInvalidMessage,
      type: 'password',
      autoComplete: 'current-password',
      label: messages.passwordFieldLabel,
    },
  ];

  function handleSubmit(payload: EmailPasswordSignIn) {
    login(payload);
  }

  return <Form schema={EmailPasswordSignInPayloadSchema} fields={fields} onSubmit={handleSubmit} disable={isLoading} />;
}

export default LoginSubForm;
