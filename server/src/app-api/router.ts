import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import { PROJECTS_ROUTE_NAME, projectsRouter } from '../projects';
import { AUTH_ROUTE_NAME, authRouter } from '../auth';
import { STRINGS_ROUTE_NAME, stringsRouter } from '../strings';

function appApiRouter() {
  const router = new Hono<HonoEnvironment>();

  return router
    .route(PROJECTS_ROUTE_NAME, projectsRouter())
    .route(AUTH_ROUTE_NAME, authRouter())
    .route(STRINGS_ROUTE_NAME, stringsRouter());
}

export default appApiRouter;
