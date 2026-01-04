import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import jwksRoute from './routes/jwks';
import signUpRoute from './routes/sign-up';
import signInRoute from './routes/sign-in';
import signOutRoute from './routes/sign-out';

const authRouter = new Hono<HonoEnvironment>();

authRouter
  .get(...jwksRoute)
  .post(...signUpRoute)
  .post(...signInRoute)
  .post(...signOutRoute);

export default authRouter;
