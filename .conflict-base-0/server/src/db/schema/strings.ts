import { check, index, pgTable, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

import auditFields from './helpers/audit-fields';
import { projects } from './projects';

// Strings table stores translation keys/identifiers for each project
// The 'context' field helps developers understand where/how the string is used
// Example: key="HOME.TITLE", context="Page title shown in browser tab and header"
export const strings = pgTable(
  'strings',
  {
    ...auditFields,
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    context: text('context'), // Optional description of where/how this string is used
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
  },
  table => [
    unique('unique_key_per_project').on(table.key, table.projectId),
    check('key_not_empty', sql`LENGTH(TRIM(${table.key})) > 0`),
    index('strings_project_id_idx').on(table.projectId),
  ],
);

// Translations table stores the actual translated text for each string in each locale
export const translations = pgTable(
  'translations',
  {
    ...auditFields,
    id: text('id').primaryKey(),
    stringId: text('string_id')
      .notNull()
      .references(() => strings.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    value: text('value').notNull(),
  },
  table => [
    unique('unique_locale_per_string').on(table.stringId, table.locale),
    check('locale_not_empty', sql`LENGTH(TRIM(${table.locale})) > 0`),
    // Covering index for efficient getTranslationsForLocale query (string_id + locale lookup)
    index('translations_string_id_locale_idx').on(table.stringId, table.locale),
  ],
);

export const stringsRelations = relations(strings, ({ many }) => ({
  translations: many(translations),
}));

export const translationsRelations = relations(translations, ({ one }) => ({
  string: one(strings, {
    fields: [translations.stringId],
    references: [strings.id],
  }),
}));
