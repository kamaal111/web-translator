import { defineMessages } from 'react-intl';

const messages = defineMessages({
  emailFieldLabel: {
    id: 'AUTH.LOGIN_SUB_FORM.EMAIL_FIELD_LABEL',
    defaultMessage: 'Email',
    description: 'Email field label',
  },
  passwordFieldLabel: {
    id: 'AUTH.LOGIN_SUB_FORM.PASSWORD_FIELD_LABEL',
    defaultMessage: 'Password',
    description: 'Password field label',
  },
  emailFieldInvalidMessage: {
    id: 'AUTH.LOGIN_SUB_FORM.EMAIL_FIELD_INVALID_MESSAGE',
    defaultMessage: 'Email is invalid, please provide an valid email.',
    description: 'Invalid message given when the user provides an invalid email',
  },
  passwordFieldInvalidMessage: {
    id: 'AUTH.LOGIN_SUB_FORM.PASSWORD_FIELD_INVALID_MESSAGE',
    defaultMessage: 'Password is invalid, please provide an valid password.',
    description: 'Invalid message given when the user provides an invalid password',
  },
});

export default messages;
