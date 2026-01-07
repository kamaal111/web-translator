import { Hono } from 'hono';

import type { HonoEnvironment } from '../context';
import jwksRoute from './routes/jwks';
import signUpRoute from './routes/sign-up';
import signInRoute from './routes/sign-in';
import signOutRoute from './routes/sign-out';
import tokenRoute from './routes/token';
import sessionRoute from './routes/session';

const authRouter = new Hono<HonoEnvironment>();

authRouter
  .get(...jwksRoute)
  .post(...signUpRoute)
  .post(...signInRoute)
  .post(...signOutRoute)
  .get(...tokenRoute)
  .get(...sessionRoute)
  .on(['POST', 'GET'], '**', c => c.get('auth').handler(c.req.raw));

export default authRouter;
