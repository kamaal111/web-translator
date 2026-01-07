import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';
import env from '../env';

const { DATABASE_URL, DEBUG } = env;

export type DrizzleDatabase = ReturnType<typeof createDrizzleDatabase>;

export function createDrizzleDatabase() {
  return drizzle(DATABASE_URL, { schema, logger: DEBUG });
}
