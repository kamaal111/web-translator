import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import requireLoggedInSession from '../auth/middleware/require-logged-in-session';
import deleteStringRoute from './routes/delete-string';
import listStringsRoute from './routes/list-strings';
import upsertTranslationsRoute from './routes/upsert-translations';
import publishSnapshotRoute from './routes/publish-snapshot';

function stringsRouter() {
  const router = new Hono<HonoEnvironment>();

  return router
    .use(requireLoggedInSession())
    .get(...listStringsRoute())
    .put(...upsertTranslationsRoute())
    .delete(...deleteStringRoute())
    .post(...publishSnapshotRoute());
}

export default stringsRouter;
