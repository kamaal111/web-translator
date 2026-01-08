import type { GetHonoContextVar, HonoContext } from '.';

export function getRequestId(c: HonoContext): GetHonoContextVar<'requestId'> {
  return c.get('requestId');
}
