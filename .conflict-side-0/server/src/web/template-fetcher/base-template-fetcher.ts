import type { TemplateName } from './constants';
import type { TemplateFetcher } from './types';

abstract class BaseTemplateFetcher implements TemplateFetcher {
  abstract get(name: TemplateName): Promise<string>;
}

export default BaseTemplateFetcher;
