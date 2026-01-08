import type { HonoContext } from '../../context';
import { getAuth } from '../../context/auth';
import { JWKS_PATH } from '../constants';

const jwksRoute = [JWKS_PATH, (c: HonoContext) => getAuth(c).handler(c.req.raw)] as const;

export default jwksRoute;
