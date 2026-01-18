import React from 'react';
import { Flex, SegmentedControl, Box } from '@radix-ui/themes';
import { FormattedMessage, type MessageDescriptor } from 'react-intl';

import LoginSubForm from '@/auth/components/login-sub-form/login-sub-form';
import SignupSubForm from '@/auth/components/signup-sub-form/signup-sub-form';
import messages from './messages';

import './login.css';

type LoginOption = (typeof LOGIN_OPTIONS)[number];

const DEFAULT_LOGIN_OPTION: LoginOption = 'login';

const LOGIN_OPTIONS = ['login', 'sign-up'] as const;

const MESSAGES_MAPPED_BY_LOGIN_OPTIONS: Record<LoginOption, MessageDescriptor> = {
  login: messages.loginSelectLabel,
  'sign-up': messages.signUpSelectLabel,
};

function Login() {
  const [loginOption, setLoginOption] = React.useState<LoginOption>(DEFAULT_LOGIN_OPTION);

  return (
    <Flex align="center" direction="column" gap="4" className="login-container">
      <SegmentedControl.Root
        value={loginOption}
        variant="surface"
        onValueChange={value => setLoginOption(value as LoginOption)}
      >
        {LOGIN_OPTIONS.map(value => (
          <SegmentedControl.Item key={value} value={value}>
            <FormattedMessage {...MESSAGES_MAPPED_BY_LOGIN_OPTIONS[value]} />
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
      <Box className="login-form-wrapper">
        <SubForm option={loginOption} />
      </Box>
    </Flex>
  );
}

function SubForm({ option }: { option: LoginOption }) {
  switch (option) {
    case 'login':
      return <LoginSubForm />;
    case 'sign-up':
      return <SignupSubForm />;
  }
}

export default Login;
