import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import { PROJECTS_ROUTE_NAME, projectsRouter } from '../projects';
import { AUTH_ROUTE_NAME, authRouter } from '../auth';

const appApiRouter = new Hono<HonoEnvironment>();

appApiRouter.route(PROJECTS_ROUTE_NAME, projectsRouter).route(AUTH_ROUTE_NAME, authRouter);

export default appApiRouter;
