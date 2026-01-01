import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import stringsRoute from './routes/strings';
import createProjectRoute from './routes/create-project';

const projectsRouter = new Hono<HonoEnvironment>();

projectsRouter.post(...createProjectRoute).get(...stringsRoute);

export default projectsRouter;
