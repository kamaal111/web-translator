import { defineMessages } from 'react-intl';

const messages = defineMessages({
  nameFieldLabel: {
    id: 'AUTH.SIGN_UP_SUB_FORM.NAME_FIELD_LABEL',
    defaultMessage: 'Name',
    description: 'Name field label',
  },
  nameFieldInvalidMessage: {
    id: 'AUTH.SIGN_UP_SUB_FORM.NAME_FIELD_INVALID_MESSAGE',
    defaultMessage: 'Name must be at least 2 words, each with at least one letter.',
    description: 'Invalid message given when the user provides an invalid name',
  },
  emailFieldLabel: {
    id: 'AUTH.SIGN_UP_SUB_FORM.EMAIL_FIELD_LABEL',
    defaultMessage: 'Email',
    description: 'Email field label',
  },
  passwordFieldLabel: {
    id: 'AUTH.SIGN_UP_SUB_FORM.PASSWORD_FIELD_LABEL',
    defaultMessage: 'Password',
    description: 'Password field label',
  },
  passwordVerificationFieldLabel: {
    id: 'AUTH.SIGN_UP_SUB_FORM.PASSWORD_VERIFICATION_FIELD_LABEL',
    defaultMessage: 'Verify password',
    description: 'Password verification field label',
  },
  emailFieldInvalidMessage: {
    id: 'AUTH.SIGN_UP_SUB_FORM.EMAIL_FIELD_INVALID_MESSAGE',
    defaultMessage: 'Email is invalid, please provide an valid email.',
    description: 'Invalid message given when the user provides an invalid email',
  },
  passwordFieldInvalidMessage: {
    id: 'AUTH.SIGN_UP_SUB_FORM.PASSWORD_FIELD_INVALID_MESSAGE',
    defaultMessage: 'Password is invalid, please provide an valid password.',
    description: 'Invalid message given when the user provides an invalid password',
  },
  passwordVerificationFieldInvalidMessage: {
    id: 'AUTH.SIGN_UP_SUB_FORM.PASSWORD_VERIFICATION_FIELD_INVALID_MESSAGE',
    defaultMessage: 'The verification password is not the same as the given password above.',
    description: 'Invalid message given when the user does not provide the same password as the password before',
  },
  passwordVerificationPlaceholder: {
    id: 'AUTH.SIGN_UP_SUB_FORM.PASSWORD_VERIFICATION_PLACEHOLDER',
    defaultMessage: 'The same above password',
    description: 'Password verification input placeholder',
  },
});

export default messages;
