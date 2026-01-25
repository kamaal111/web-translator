import { createMiddleware } from 'hono/factory';

import type { HonoVariables } from '../../context';
import { getUserSession } from '../utils/session';

function requireLoggedInSession() {
  return createMiddleware<{ Variables: HonoVariables }>(async (c, next) => {
    const sessionResponse = await getUserSession(c);

    c.set('session', sessionResponse);
    await next();
  });
}

export default requireLoggedInSession;
