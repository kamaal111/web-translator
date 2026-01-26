import assert from 'node:assert';

import { eq, sql } from 'drizzle-orm';

import type { DrizzleDatabase } from '../../../db';
import { strings, translations } from '../../../db/schema';
import type StringModel from '../../models/string';
import { newString } from '../../models/string';
import type { StringsRepository, TranslationEntry } from './types';
import type { HonoContext } from '../../../context';
import { getDrizzle } from '../../../context/database';
import { verifySessionIsSet } from '../../../auth/utils/session';
import type Project from '../../../projects/models/project';

type StringUpdate = { id: string; context: string | null };

class StringsRepositoryImpl implements StringsRepository {
  private readonly context: HonoContext;

  constructor(params: { context: HonoContext }) {
    this.context = params.context;
  }

  list = async (project: Project): Promise<StringModel[]> => {
    const session = await verifySessionIsSet(this.context);
    assert(project.userId === session.user.id, 'Project we are listing should be the users project');

    const projectStrings = await getDrizzle(this.context).query.strings.findMany({
      where: () => eq(strings.projectId, project.id),
    });

    return projectStrings.map(newString);
  };

  upsertTranslations = async (project: Project, entries: TranslationEntry[]): Promise<{ updatedCount: number }> => {
    const session = await verifySessionIsSet(this.context);
    assert(project.userId === session.user.id, 'Project we are listing should be the users project');

    const drizzle = getDrizzle(this.context);
    const keys = entries.map(e => e.key);
    const now = new Date();

    const existingStrings = await drizzle.query.strings.findMany({
      where: () => sql`${strings.projectId} = ${project.id} AND ${strings.key} IN ${keys}`,
    });
    const existingKeyMap = new Map(existingStrings.map(s => [s.key, s.id]));

    const { stringsToInsert, stringsToUpdate, keyToIdMap } = categorizeEntries(
      entries,
      existingKeyMap,
      project.id,
      now,
    );
    await persistStrings(drizzle, stringsToInsert, stringsToUpdate, now);

    const translationsToUpsert = buildTranslationInserts(entries, keyToIdMap, now);
    await upsertTranslationsBatch(drizzle, translationsToUpsert);

    return { updatedCount: translationsToUpsert.length };
  };
}

function categorizeEntries(
  entries: TranslationEntry[],
  existingKeyMap: Map<string, string>,
  projectId: string,
  now: Date,
): {
  stringsToInsert: (typeof strings.$inferInsert)[];
  stringsToUpdate: StringUpdate[];
  keyToIdMap: Map<string, string>;
} {
  const stringsToInsert: (typeof strings.$inferInsert)[] = [];
  const stringsToUpdate: StringUpdate[] = [];
  const keyToIdMap = new Map<string, string>();

  for (const entry of entries) {
    const existingId = existingKeyMap.get(entry.key);
    if (existingId) {
      keyToIdMap.set(entry.key, existingId);
      if (entry.context !== undefined) {
        stringsToUpdate.push({ id: existingId, context: entry.context || null });
      }
    } else {
      const newId = Bun.randomUUIDv7();
      keyToIdMap.set(entry.key, newId);
      stringsToInsert.push({
        id: newId,
        key: entry.key,
        context: entry.context || null,
        projectId,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return { stringsToInsert, stringsToUpdate, keyToIdMap };
}

async function persistStrings(
  drizzle: DrizzleDatabase,
  stringsToInsert: (typeof strings.$inferInsert)[],
  stringsToUpdate: StringUpdate[],
  now: Date,
): Promise<void> {
  if (stringsToInsert.length > 0) {
    await drizzle.insert(strings).values(stringsToInsert);
  }

  for (const update of stringsToUpdate) {
    await drizzle.update(strings).set({ context: update.context, updatedAt: now }).where(eq(strings.id, update.id));
  }
}

function buildTranslationInserts(
  entries: TranslationEntry[],
  keyToIdMap: Map<string, string>,
  now: Date,
): (typeof translations.$inferInsert)[] {
  const translationsToUpsert: (typeof translations.$inferInsert)[] = [];

  for (const entry of entries) {
    const stringId = keyToIdMap.get(entry.key);
    assert(stringId, 'String ID should exist at this point');

    for (const [locale, value] of Object.entries(entry.translations)) {
      translationsToUpsert.push({
        id: Bun.randomUUIDv7(),
        stringId,
        locale,
        value,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return translationsToUpsert;
}

async function upsertTranslationsBatch(
  drizzle: DrizzleDatabase,
  translationsToUpsert: (typeof translations.$inferInsert)[],
): Promise<void> {
  if (translationsToUpsert.length === 0) {
    return;
  }

  await drizzle
    .insert(translations)
    .values(translationsToUpsert)
    .onConflictDoUpdate({
      target: [translations.stringId, translations.locale],
      set: { value: sql`excluded.value`, updatedAt: sql`excluded.updated_at` },
    });
}

export default StringsRepositoryImpl;
