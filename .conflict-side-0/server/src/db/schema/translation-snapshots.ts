import { index, integer, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { projects } from './projects';

// Translation snapshots store immutable, versioned copies of translations for a project/locale.
// Using JSONB for the data field enables single-query reads with no joins - critical for
// high-performance public API reads. Snapshots are immutable once created.
export const translationSnapshots = pgTable(
  'translation_snapshots',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    version: integer('version').notNull(),
    // JSONB blob containing all translations as { key: value } for fast reads
    data: jsonb('data').$type<Record<string, string>>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    // Ensure each project/locale has unique version numbers
    unique('unique_version_per_project_locale').on(table.projectId, table.locale, table.version),
    // Primary lookup index: fetch specific version efficiently
    index('translation_snapshots_project_locale_version_idx').on(table.projectId, table.locale, table.version),
    // Secondary index: list versions for a project/locale
    index('translation_snapshots_project_locale_idx').on(table.projectId, table.locale),
  ],
);
