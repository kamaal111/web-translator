import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import { getTranslationsRoute } from '../strings';

function publicApiRouter() {
  const router = new Hono<HonoEnvironment>();

  return router.get(...getTranslationsRoute());
}

export default publicApiRouter;
