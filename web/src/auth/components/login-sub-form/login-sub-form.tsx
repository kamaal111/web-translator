import { useLogin } from '@/auth/hooks/use-login';
import type { FormField } from '@/common/components/form/form';
import { LoginPayloadSchema, type LoginPayload } from '@/auth/schemas';
import Form from '@/common/components/form/form';
import messages from './messages';

function LoginSubForm() {
  const {
    action: login,
    result: { isLoading },
  } = useLogin();

  const fields: Array<FormField<keyof LoginPayload>> = [
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

  function handleSubmit(payload: LoginPayload) {
    login(payload);
  }

  return <Form schema={LoginPayloadSchema} fields={fields} onSubmit={handleSubmit} disable={isLoading} />;
}

export default LoginSubForm;
