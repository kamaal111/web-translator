import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import jwksRoute from './routes/jwks';
import signUpRoute from './routes/sign-up';

const authRouter = new Hono<HonoEnvironment>();

authRouter.get(...jwksRoute).post(...signUpRoute);

export default authRouter;
