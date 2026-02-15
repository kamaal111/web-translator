import type { GetHonoContextVar, HonoContext } from '.';

export function getAuth(c: HonoContext): GetHonoContextVar<'auth'> {
  return c.get('auth');
}
