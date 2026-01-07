import { describeRoute } from 'hono-openapi';
import z from 'zod';

import type { HonoContext } from '../../context';
import { handleAuthRequest } from '../utils/request';
import { OPENAPI_TAG } from '../constants';

type SignOutInput = { out: undefined };

const SignOutResponseSchema = z.object({}).loose();

const signOutRoute = [
  '/sign-out',
  describeRoute({
    summary: 'Sign out',
    description: 'Sign out the current user and invalidate the session',
    tags: [OPENAPI_TAG],
    responses: {
      204: {
        description: 'Sign out successful',
      },
    },
  }),
  async (c: HonoContext<SignOutInput>) => {
    await handleAuthRequest(c, { responseSchema: SignOutResponseSchema, requireSessionToken: false });

    return c.body(null, 204);
  },
] as const;

export default signOutRoute;
