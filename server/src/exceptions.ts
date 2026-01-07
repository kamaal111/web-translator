import { HTTPException } from 'hono/http-exception';

import type { HonoContext } from './context';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class APIException extends HTTPException {
  readonly c: HonoContext;

  constructor(
    c: HonoContext,
    statusCode: ContentfulStatusCode,
    options: { message: string; code?: string; headers?: Headers; context?: unknown },
  ) {
    const response = new Response(
      JSON.stringify({
        message: options.message,
        code: options.code,
        context: options.context,
        request_id: c.get('requestId'),
      }),
      {
        status: statusCode,
        headers: options.headers ?? { 'Content-Type': 'application/json' },
      },
    );
    super(statusCode, { res: response });
    this.c = c;
  }
}

export class Unauthorized extends APIException {
  constructor(c: HonoContext, options?: { message?: string }) {
    super(c, 401, {
      message: options?.message ?? 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  }
}

export class NotFound extends APIException {
  constructor(c: HonoContext, options?: { message?: string }) {
    super(c, 404, {
      message: options?.message ?? 'Not found',
      code: 'NOT_FOUND',
    });
  }
}

export class ServerInternal extends APIException {
  constructor(c: HonoContext, options?: { message?: string }) {
    super(c, 500, {
      message: options?.message ?? 'Internal server error',
      code: 'SERVER_INTERNAL',
    });
  }
}
