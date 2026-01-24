import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import createProjectRoute from './routes/create-project';
import listProjectsRoute from './routes/list-projects';

const projectsRouter = new Hono<HonoEnvironment>();

projectsRouter.post(...createProjectRoute).get(...listProjectsRoute);

export default projectsRouter;
