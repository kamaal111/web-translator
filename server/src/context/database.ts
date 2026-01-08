import type { GetHonoContextVar, HonoContext } from '.';

export function getDatabase(c: HonoContext): GetHonoContextVar<'db'> {
  return c.get('db');
}
