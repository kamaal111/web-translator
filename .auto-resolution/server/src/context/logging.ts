import type { GetHonoContextVar, HonoContext } from '.';

export function getLogger(c: HonoContext): GetHonoContextVar<'logger'> {
  return c.get('logger');
}
