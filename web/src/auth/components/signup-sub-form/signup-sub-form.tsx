import { EmailPasswordSignUpPayloadSchema } from '@wt/schemas';
import z from 'zod';

import Form from '@/common/components/form/form';
import useSignup from '@/auth/hooks/use-signup';
import messages from './messages';

type SignupPayload = z.infer<typeof SignupPayloadSchema>;

const VERIFICATION_PASSWORD_KEY = 'verificationPassword';

const FIELDS = [
  {
    id: 'name',
    placeholder: 'John Doe',
    invalidMessage: messages.nameFieldInvalidMessage,
    type: 'text',
    autoComplete: 'name',
    label: messages.nameFieldLabel,
  },
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
  {
    id: VERIFICATION_PASSWORD_KEY,
    placeholder: messages.passwordVerificationPlaceholder,
    invalidMessage: messages.passwordVerificationFieldInvalidMessage,
    type: 'password',
    autoComplete: 'off',
    label: messages.passwordVerificationFieldLabel,
  },
] as const;

const SignupPayloadSchema = EmailPasswordSignUpPayloadSchema.extend({
  [VERIFICATION_PASSWORD_KEY]: EmailPasswordSignUpPayloadSchema.shape.password,
});

function SignupSubForm() {
  const {
    action: signup,
    result: { isLoading },
  } = useSignup();

  function handleSubmit(payload: SignupPayload) {
    signup(payload);
  }

  return <Form schema={SignupPayloadSchema} fields={FIELDS} onSubmit={handleSubmit} disable={isLoading} />;
}

export default SignupSubForm;
