import React from 'react';

import type { ConfigurationsState, UseConfigurationsReturnType } from './types';

export const ConfigurationsContext = React.createContext<ConfigurationsState>(null);

export function useConfigurations(): UseConfigurationsReturnType {
  const [context, fetchSession] = React.useContext(ConfigurationsContext) ?? [null, async () => {}];

  return {
    context,
    fetchSession,
    isLoggedIn: false,
  };
}
