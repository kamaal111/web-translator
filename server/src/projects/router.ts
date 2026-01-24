import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import requireLoggedInSession from '../auth/middleware/require-logged-in-session';
import createProjectRoute from './routes/create-project';
import listProjectsRoute from './routes/list-projects';

const projectsRouter = new Hono<HonoEnvironment>();

projectsRouter
  .use(requireLoggedInSession())
  .post(...createProjectRoute)
  .get(...listProjectsRoute);

export default projectsRouter;
