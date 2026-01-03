import type { TemplateName } from './constants';

export interface TemplateFetcher {
  get(name: TemplateName): Promise<string>;
}
