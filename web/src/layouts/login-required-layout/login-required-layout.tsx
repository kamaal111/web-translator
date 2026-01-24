import React from 'react';
import { Outlet, useNavigate } from 'react-router';

import { useConfigurations } from '@/context/use-configurations';

function LoginRequiredLayout() {
  const { isLoggedIn } = useConfigurations();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return <Outlet />;
}

export default LoginRequiredLayout;
