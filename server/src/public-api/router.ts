import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import getTranslationsRoute from './routes/get-translations';

function publicApiRouter() {
  const router = new Hono<HonoEnvironment>();

  return router.get(...getTranslationsRoute);
}

export default publicApiRouter;
