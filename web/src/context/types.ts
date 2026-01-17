import type { WebTranslatorContext } from './schemas';

export type ConfigurationsState = [context: WebTranslatorContext | null, fetchSession: () => Promise<void>] | null;

export type UseConfigurationsReturnType = {
  context: WebTranslatorContext | null;
  isLoggedIn: boolean;
  fetchSession: () => Promise<void>;
};
