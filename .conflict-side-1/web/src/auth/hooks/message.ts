import { defineMessages } from 'react-intl';

const messages = defineMessages({
  defaultLoginError: {
    id: 'AUTH.API.DEFAULT_LOGIN_ERROR',
    defaultMessage: 'Invalid credentials provided',
    description: 'Default log in error',
  },
  defaultSignUpError: {
    id: 'AUTH.API.DEFAULT_SIGN_UP_ERROR',
    defaultMessage: 'Failed to sign up with the given credentials',
    description: 'Default sign up error',
  },
  conflictSignUpError: {
    id: 'AUTH.API.CONFLICT_SIGN_UP_ERROR',
    defaultMessage: 'The given email already exists',
    description: 'Error for when user signs up with a email that already exists',
  },
});

export default messages;
