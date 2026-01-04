import { arrays } from '@kamaalio/kamaal';

import type { HonoContext } from '.';

export function getLogEvents(c: HonoContext) {
  return c.get('logEvents');
}

export function addToLogEvents(c: HonoContext, name: string, event: Record<string, string>) {
  const logEvents = getLogEvents(c);
  c.set('logEvents', arrays.appended(logEvents, { [name]: event }));
}
