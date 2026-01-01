import type { Next } from 'hono';
import { logger as honoLoggerMiddleware } from 'hono/logger';

import type { HonoContext } from '../context';
import { logger } from '../utils/logging';

export function loggingMiddleware() {
  return (c: HonoContext, next: Next) => {
    return honoLoggerMiddleware((str: string, ...rest: string[]) => {
      logger(c, str, ...rest);
    })(c, next);
  };
}
