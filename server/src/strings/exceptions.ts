import { HTTPException } from 'hono/http-exception';

import type { HonoContext } from '../context';

export class StringKeyAlreadyExists extends HTTPException {
  constructor(c: HonoContext) {
    super(409, {
      res: c.json({
        error: 'String key already exists for this project',
        code: 'STRING_KEY_ALREADY_EXISTS',
      }),
    });
  }
}
