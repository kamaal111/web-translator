import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import requireLoggedInSession from '../auth/middleware/require-logged-in-session';
import createProjectRoute from './routes/create-project';
import listProjectsRoute from './routes/list-projects';
import readProjectRoute from './routes/read-project';
import listStringVersionsRoute from './routes/list-string-versions';

function projectsRouter() {
  const router = new Hono<HonoEnvironment>();

  return router
    .use(requireLoggedInSession())
    .post(...createProjectRoute())
    .get(...listProjectsRoute())
    .get(...listStringVersionsRoute())
    .get(...readProjectRoute());
}

export default projectsRouter;
