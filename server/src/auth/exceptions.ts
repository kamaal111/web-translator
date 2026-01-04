import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { APIException } from '../exceptions';
import type { HonoContext } from '../context';

const CODE_TO_STATUS: Record<string, ContentfulStatusCode> = {
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 409,
  INVALID_EMAIL_OR_PASSWORD: 401,
  MISSING_OR_NULL_ORIGIN: 401,
};

export class BetterAuthException extends APIException {
  constructor(c: HonoContext, { code, message, headers }: { code: string; message: string; headers: Headers }) {
    super(c, CODE_TO_STATUS[code] ?? 500, { message, code, headers });
  }
}
