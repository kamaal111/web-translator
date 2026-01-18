import { createMiddleware } from 'hono/factory';

import type { HonoVariables } from '../../context';
import { getSession } from '../../context/session';
import { getUserSession } from '../utils/session';

function requireLoggedInSession() {
  return createMiddleware<{ Variables: HonoVariables }>(async (c, next) => {
    if (getSession(c) != null) {
      await next();
      return;
    }

    const sessionResponse = await getUserSession(c);

    c.set('session', sessionResponse);
    await next();
  });
}

export default requireLoggedInSession;
