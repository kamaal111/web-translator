import type { HonoContext } from '.';
import type { Logger } from './types';

export function getLogger(c: HonoContext): Logger {
  return c.get('logger');
}
