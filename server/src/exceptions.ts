import { HTTPException } from 'hono/http-exception';

import type { HonoContext } from './context';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { getRequestId } from './context/request-id';
import { getLogger } from './context/logging';

export class APIException extends HTTPException {
  readonly c: HonoContext;

  constructor(
    c: HonoContext,
    statusCode: ContentfulStatusCode,
    options: { message: string; code?: string; headers?: Headers; context?: unknown; name?: string },
  ) {
    const response = new Response(
      JSON.stringify({
        message: options.message,
        code: options.code,
        context: options.context,
        request_id: getRequestId(c),
      }),
      {
        status: statusCode,
        headers: options.headers ?? { 'Content-Type': 'application/json' },
      },
    );
    super(statusCode, { res: response });
    this.c = c;
    this.name = options.name ?? this.name;

    getLogger(c).error('Error event', { error_message: options.message, error_name: this.name });
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
  constructor(c: HonoContext, options?: { message?: string; name?: string }) {
    super(c, 404, {
      message: options?.message ?? 'Not found',
      code: 'NOT_FOUND',
      name: options?.name,
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

export class Conflict extends APIException {
  constructor(c: HonoContext, options?: { message?: string; code?: string; name?: string }) {
    super(c, 409, {
      message: options?.message ?? 'Conflict',
      code: options?.code ?? 'CONFLICT',
      name: options?.name,
    });
  }
}
