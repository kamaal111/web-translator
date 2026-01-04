import type { Database } from '../db';
import type { HonoContext } from '.';

export function getDatabase(c: HonoContext): Database {
  return c.get('db');
}
