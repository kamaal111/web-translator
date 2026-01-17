import { Flex } from '@radix-ui/themes';

import LoginSubForm from '@/auth/components/login-sub-form/login-sub-form';

function Login() {
  return (
    <Flex align="center" direction="column" gap="4">
      <LoginSubForm />
    </Flex>
  );
}

export default Login;
