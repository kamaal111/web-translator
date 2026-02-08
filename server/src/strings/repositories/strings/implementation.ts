import assert from 'node:assert';

import { and, eq, sql, inArray } from 'drizzle-orm';

import type { DrizzleDatabase } from '../../../db';
import { strings, translations } from '../../../db/schema';
import type StringModel from '../../models/string';
import { newString } from '../../models/string';
import type { StringsRepository, TranslationEntry } from './types';
import DraftWithAuthor, { newDraftWithAuthor } from '../../models/draft-with-author';
import type { HonoContext } from '../../../context';
import { getDrizzle } from '../../../context/database';
import { verifySessionIsSet } from '../../../auth/utils/session';
import type Project from '../../../projects/models/project';
import type Translation from '../../models/translation';
import { newTranslation } from '../../models/translation';
import { translationModelToDbInsert } from '../../mappers/translation';
import { stringModelToDbInsert } from '../../mappers/strings';
import { ConcurrentModificationException } from '../../../projects/exceptions';
import { toISO8601String } from '../../../utils/dates';
import { getLogger } from '../../../context/logging';

type StringUpdate = { id: string; context: string | null };

class StringsRepositoryImpl implements StringsRepository {
  private readonly context: HonoContext;

  constructor(params: { context: HonoContext }) {
    this.context = params.context;
  }

  listWithTranslations = async (
    project: Project,
  ): Promise<Array<{ string: StringModel; translations: Map<string, string> }>> => {
    const session = await verifySessionIsSet(this.context);
    assert(project.userId === session.user.id, 'Project we are listing should be the users project');

    const drizzle = getDrizzle(this.context);
    const projectStrings = await drizzle.query.strings.findMany({
      where: () => eq(strings.projectId, project.id),
      with: { translations: true },
    });

    return projectStrings.map(str => {
      const translationsMap = new Map<string, string>();
      if ('translations' in str && Array.isArray(str.translations)) {
        for (const t of str.translations) {
          translationsMap.set(t.locale, t.value);
        }
      }

      return {
        string: newString(str),
        translations: translationsMap,
      };
    });
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
      draftsMap.set(
        row.locale,
        newDraftWithAuthor({
          locale: row.locale,
          value: row.value,
          updatedAt: row.updatedAt,
          updatedBy: {
            id: session.user.id,
            name: session.user.name,
          },
        }),
      );

      return draftsMap;
    }, new Map<string, DraftWithAuthor>());
  };

  updateDraft = async (
    project: Project,
    stringRecord: StringModel,
    translationsMap: Record<string, string>,
    ifUnmodifiedSince?: Date,
  ): Promise<DraftWithAuthor[]> => {
    const session = await verifySessionIsSet(this.context);
    assert(project.userId === session.user.id, 'Project should belong to the user');
    assert(stringRecord.projectId === project.id, 'Given string should belong to the project');

    const drizzle = getDrizzle(this.context);
    const locales = Object.keys(translationsMap);

    await this.checkForConcurrentModifications(project, stringRecord, locales, ifUnmodifiedSince, drizzle);

    const now = new Date();
    const translationsToUpdate = Object.entries(translationsMap).map(([locale, value]) => {
      return newTranslation({
        stringId: stringRecord.id,
        locale,
        value,
        createdAt: now,
        updatedAt: now,
        id: null,
      });
    });
    await drizzle
      .insert(translations)
      .values(translationsToUpdate.map(translationModelToDbInsert))
      .onConflictDoUpdate({
        target: [translations.stringId, translations.locale],
        set: { value: sql`excluded.value`, updatedAt: sql`excluded.updated_at` },
      });

    return translationsToUpdate.map(t =>
      newDraftWithAuthor({
        locale: t.locale,
        value: t.value,
        updatedAt: now,
        updatedBy: {
          id: session.user.id,
          name: session.user.name,
        },
      }),
    );
  };

  private checkForConcurrentModifications = async (
    project: Project,
    stringRecord: StringModel,
    locales: string[],
    ifUnmodifiedSince: Date | undefined,
    drizzle: DrizzleDatabase,
  ): Promise<void> => {
    if (!ifUnmodifiedSince || locales.length === 0) {
      return;
    }

    const existingTranslations = await drizzle
      .select({ locale: translations.locale, updatedAt: translations.updatedAt })
      .from(translations)
      .where(and(eq(translations.stringId, stringRecord.id), inArray(translations.locale, locales)));
    const conflictingTranslation = existingTranslations.find(existing => existing.updatedAt > ifUnmodifiedSince);
    if (!conflictingTranslation) {
      return;
    }

    const draftsMap = await this.getDraftTranslationsForLocales(stringRecord, locales);
    const draft = draftsMap.get(conflictingTranslation.locale);
    getLogger(this.context).error('Concurrent modification detected', {
      project_id: project.id,
      string_key: stringRecord.key,
      requested_locales: locales.join(', '),
    });

    throw new ConcurrentModificationException(this.context, {
      message: 'Another user modified this translation recently. Review changes and retry.',
      conflictDetails: draft
        ? {
            locale: conflictingTranslation.locale,
            lastModifiedAt: toISO8601String(draft.updatedAt),
            lastModifiedBy: draft.updatedBy,
          }
        : {
            locale: conflictingTranslation.locale,
            lastModifiedAt: toISO8601String(new Date()),
            lastModifiedBy: { id: 'unknown', name: 'Unknown' },
          },
    });
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
