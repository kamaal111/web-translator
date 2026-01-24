import { check, pgTable, text, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import auditFields from './helpers/audit-fields';
import { user } from './better-auth';

export const projects = pgTable(
  'projects',
  {
    ...auditFields,
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    defaultLocale: text('default_locale').notNull(),
    enabledLocales: text('enabled_locales').array().notNull(),
    publicKey: text('public_key').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  table => [
    unique('unique_name_per_user').on(table.name, table.userId),
    check('name_not_empty', sql`LENGTH(TRIM(${table.name})) > 0`),
  ],
);
