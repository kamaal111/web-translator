import assert from 'node:assert';

import { and, eq, sql, inArray } from 'drizzle-orm';

import type { DrizzleDatabase } from '../../../db';
import { strings, translations } from '../../../db/schema';
import type StringModel from '../../models/string';
import { newString } from '../../models/string';
import type { StringsRepository, TranslationEntry, DraftWithAuthor } from './types';
import type { HonoContext } from '../../../context';
import { getDrizzle } from '../../../context/database';
import { verifySessionIsSet } from '../../../auth/utils/session';
import type Project from '../../../projects/models/project';
import type Translation from '../../models/translation';
import { newTranslation } from '../../models/translation';
import { translationModelToDbInsert } from '../../mappers/translation';
import { stringModelToDbInsert } from '../../mappers/strings';

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
    const existingStrings = await drizzle
      .select({ key: strings.key, id: strings.id })
      .from(strings)
      .where(and(eq(strings.projectId, project.id), inArray(strings.key, keys)));
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

  findByKey = async (project: Project, key: string): Promise<StringModel | null> => {
    const session = await verifySessionIsSet(this.context);
    assert(project.userId === session.user.id, 'Project should belong to the user');

    const stringRecord = await getDrizzle(this.context).query.strings.findFirst({
      where: () => and(eq(strings.projectId, project.id), eq(strings.key, key)),
    });
    if (!stringRecord) {
      return null;
    }

    return newString(stringRecord);
  };

  getDraftTranslationsLocales = async (str: StringModel, locale?: string): Promise<Set<string>> => {
    await verifySessionIsSet(this.context);
    const conditions = [eq(translations.stringId, str.id)];
    if (locale) {
      conditions.push(eq(translations.locale, locale));
    }

    const results = await getDrizzle(this.context)
      .select({ locale: translations.locale })
      .from(translations)
      .where(and(...conditions));

    return new Set(results.map(dt => dt.locale));
  };

  getDraftTranslationsForLocales = async (
    str: StringModel,
    locales: string[],
  ): Promise<Map<string, DraftWithAuthor>> => {
    if (locales.length === 0) {
      return new Map();
    }

    const session = await verifySessionIsSet(this.context);
    const results = await getDrizzle(this.context)
      .select({ locale: translations.locale, value: translations.value, updatedAt: translations.updatedAt })
      .from(translations)
      .where(and(eq(translations.stringId, str.id), inArray(translations.locale, locales)));

    return results.reduce((draftsMap, row) => {
      draftsMap.set(row.locale, {
        locale: row.locale,
        value: row.value,
        updatedAt: row.updatedAt,
        updatedBy: {
          id: session.user.id,
          name: session.user.name,
        },
      });

      return draftsMap;
    }, new Map<string, DraftWithAuthor>());
  };
}

function categorizeEntries(
  entries: TranslationEntry[],
  existingKeyMap: Map<string, string>,
  projectId: string,
  now: Date,
): {
  stringsToInsert: StringModel[];
  stringsToUpdate: StringUpdate[];
  keyToIdMap: Map<string, string>;
} {
  const stringsToInsert: StringModel[] = [];
  const stringsToUpdate: StringUpdate[] = [];
  const keyToIdMap = new Map<string, string>();
  for (const entry of entries) {
    const existingId = existingKeyMap.get(entry.key);
    if (existingId) {
      keyToIdMap.set(entry.key, existingId);
      if (entry.context != null) {
        stringsToUpdate.push({ id: existingId, context: entry.context || null });
      }
    } else {
      const newId = Bun.randomUUIDv7();
      keyToIdMap.set(entry.key, newId);
      stringsToInsert.push(
        newString({
          id: newId,
          key: entry.key,
          context: entry.context || null,
          projectId,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

  return { stringsToInsert, stringsToUpdate, keyToIdMap };
}

async function persistStrings(
  drizzle: DrizzleDatabase,
  stringsToInsert: StringModel[],
  stringsToUpdate: StringUpdate[],
  now: Date,
): Promise<void> {
  if (stringsToInsert.length > 0) {
    await drizzle.insert(strings).values(stringsToInsert.map(stringModelToDbInsert));
  }

  if (stringsToUpdate.length === 0) {
    return;
  }

  // Note: sql`` tagged templates use parameterized queries, preventing SQL injection
  const ids = stringsToUpdate.map(u => u.id);
  const contextCase = sql.join(
    stringsToUpdate.map(u => sql`WHEN ${strings.id} = ${u.id} THEN ${u.context}`),
    sql.raw(' '),
  );
  await drizzle
    .update(strings)
    .set({ context: sql`CASE ${contextCase} END`, updatedAt: now })
    .where(inArray(strings.id, ids));
}

function buildTranslationInserts(
  entries: TranslationEntry[],
  keyToIdMap: Map<string, string>,
  now: Date,
): Translation[] {
  const translationsToUpsert: Translation[] = [];
  for (const entry of entries) {
    const stringId = keyToIdMap.get(entry.key);
    assert(stringId, 'String ID should exist at this point');

    for (const [locale, value] of Object.entries(entry.translations)) {
      const translation = newTranslation({ stringId, locale, value, createdAt: now, updatedAt: now, id: null });
      translationsToUpsert.push(translation);
    }
  }

  return translationsToUpsert;
}

async function upsertTranslationsBatch(drizzle: DrizzleDatabase, translationsToUpsert: Translation[]): Promise<void> {
  if (translationsToUpsert.length === 0) {
    return;
  }

  await drizzle
    .insert(translations)
    .values(translationsToUpsert.map(translationModelToDbInsert))
    .onConflictDoUpdate({
      target: [translations.stringId, translations.locale],
      set: { value: sql`excluded.value`, updatedAt: sql`excluded.updated_at` },
    });
}

export default StringsRepositoryImpl;
