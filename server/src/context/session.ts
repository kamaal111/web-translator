import type { GetHonoContextVar, HonoContext } from '.';

export function getSession(c: HonoContext): GetHonoContextVar<'session'> {
  return c.get('session');
}
