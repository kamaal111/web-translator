import type { HonoContext } from '../../context';
import { JWKS_PATH } from '../better-auth';

const jwksRoute = [JWKS_PATH, (c: HonoContext) => c.get('auth').handler(c.req.raw)] as const;

export default jwksRoute;
