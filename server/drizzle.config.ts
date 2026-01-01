import assert from 'node:assert';

import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL;
assert(DATABASE_URL != null);

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: { url: DATABASE_URL },
});
