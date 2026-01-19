import { pgTable, text } from 'drizzle-orm/pg-core';

import auditFields from './helpers/audit-fields';
import { user } from './better-auth';

export const projects = pgTable('projects', {
  ...auditFields,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  defaultLocale: text('default_locale').notNull(),
  enabledLocales: text('enabled_locales').array().notNull(),
  publicKey: text('public_key').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});
