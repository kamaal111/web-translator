import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';

const healthRouter = new Hono<HonoEnvironment>();

healthRouter.get('/ping', c => c.json({ message: 'PONG' }));

export default healthRouter;
