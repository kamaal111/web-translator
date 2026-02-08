import assert from 'node:assert';

import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { arrays } from '@kamaalio/kamaal';

import { strings, translations, translationSnapshots } from '../../../db/schema';
import type { HonoContext } from '../../../context';
import { getDrizzle } from '../../../context/database';
import type { SnapshotsRepository, PaginatedSnapshotVersions } from './types';
import { verifySessionIsSet } from '../../../auth/utils/session';
import type Project from '../../../projects/models/project';
import type TranslationSnapshot from '../../models/translation-snapshot';
import { dbTranslationSnapshotToModel } from '../../mappers/translation-snapshot';
import { newTranslationSnapshot, type ITranslationSnapshot } from '../../models/translation-snapshot';
import type StringModel from '../../models/string';

class SnapshotsRepositoryImpl implements SnapshotsRepository {
  private readonly context: HonoContext;

  constructor(params: { context: HonoContext }) {
    this.context = params.context;
  }

  getSnapshot = async (projectId: string, locale: string, version: number): Promise<TranslationSnapshot | null> => {
    const snapshot = await getDrizzle(this.context).query.translationSnapshots.findFirst({
      where: () =>
        and(
          eq(translationSnapshots.projectId, projectId),
          eq(translationSnapshots.locale, locale),
          eq(translationSnapshots.version, version),
        ),
    });
    if (!snapshot) {
      return null;
    }

    return dbTranslationSnapshotToModel(snapshot);
  };

  getLatestSnapshot = async (projectId: string, locale: string): Promise<TranslationSnapshot | null> => {
    const snapshot = await getDrizzle(this.context).query.translationSnapshots.findFirst({
      where: () => and(eq(translationSnapshots.projectId, projectId), eq(translationSnapshots.locale, locale)),
      orderBy: () => desc(translationSnapshots.version),
    });
    if (!snapshot) {
      return null;
    }

    return dbTranslationSnapshotToModel(snapshot);
  };

  createSnapshot = async (project: Project, locale: string): Promise<TranslationSnapshot> => {
    const session = await verifySessionIsSet(this.context);
    assert(session.user.id === project.userId, 'Should have been called with the user that owns the project');

    const db = getDrizzle(this.context);
    const [versionRow] = await db
      .select({ maxVersion: sql<number>`COALESCE(MAX(${translationSnapshots.version}), 0)` })
      .from(translationSnapshots)
      .where(and(eq(translationSnapshots.projectId, project.id), eq(translationSnapshots.locale, locale)));
    assert(versionRow, 'SQL COALESCE should always return a row');

    const nextVersion = versionRow.maxVersion + 1;
    const currentTranslations = await db
      .select({ key: strings.key, value: translations.value })
      .from(strings)
      .innerJoin(translations, and(eq(translations.stringId, strings.id), eq(translations.locale, locale)))
      .where(eq(strings.projectId, project.id));
    const data = currentTranslations.reduce<Record<string, string>>((data, row) => {
      return { ...data, [row.key]: row.value };
    }, {});
    const snapshotData: ITranslationSnapshot = {
      id: Bun.randomUUIDv7(),
      projectId: project.id,
      locale,
      version: nextVersion,
      data,
    };
    await getDrizzle(this.context).insert(translationSnapshots).values(snapshotData);

    return newTranslationSnapshot(snapshotData);
  };

  getLocalesWithSnapshots = async (project: Project): Promise<Set<string>> => {
    const session = await verifySessionIsSet(this.context);
    assert(session.user.id === project.userId, 'Should have been called with the user that owns the project');

    const results = await getDrizzle(this.context)
      .selectDistinct({ locale: translationSnapshots.locale })
      .from(translationSnapshots)
      .where(eq(translationSnapshots.projectId, project.id));

    return new Set([...results.map(r => r.locale)]);
  };

  getVersionsForStringAcrossLocales = async (
    project: Project,
    locales: string[],
    str: StringModel,
    page: number,
    pageSize: number,
  ): Promise<Map<string, PaginatedSnapshotVersions>> => {
    if (locales.length === 0) {
      return new Map();
    }

    const session = await verifySessionIsSet(this.context);
    assert(session.user.id === project.userId, 'Should have been called with the user that owns the project');
    assert(project.id === str.projectId, 'The given string model should belong to the given project');

    const db = getDrizzle(this.context);
    const countResults = await db
      .select({ locale: translationSnapshots.locale, count: sql<number>`count(*)::int` })
      .from(translationSnapshots)
      .where(
        and(
          eq(translationSnapshots.projectId, project.id),
          inArray(translationSnapshots.locale, locales),
          sql`${translationSnapshots.data} ? ${str.key}`,
        ),
      )
      .groupBy(translationSnapshots.locale);
    const countsMap = countResults.reduce((acc, row) => acc.set(row.locale, row.count), new Map<string, number>());
    const snapshots = await db
      .select({
        locale: translationSnapshots.locale,
        version: translationSnapshots.version,
        data: translationSnapshots.data,
        createdAt: translationSnapshots.createdAt,
      })
      .from(translationSnapshots)
      .where(
        and(
          eq(translationSnapshots.projectId, project.id),
          inArray(translationSnapshots.locale, locales),
          sql`${translationSnapshots.data} ? ${str.key}`,
        ),
      )
      .orderBy(translationSnapshots.locale, desc(translationSnapshots.version));

    const snapshotsByLocale = snapshots.reduce(
      (acc, snapshot) => acc.set(snapshot.locale, (acc.get(snapshot.locale) ?? []).concat(snapshot)),
      new Map<string, typeof snapshots>(),
    );
    const offset = (page - 1) * pageSize;

    return locales.reduce((acc, locale) => {
      const localeSnapshots = snapshotsByLocale.get(locale) ?? [];
      const totalVersions = countsMap.get(locale) ?? 0;
      const versions = arrays.compactMap(localeSnapshots.slice(offset, offset + pageSize), snapshot => {
        const value = snapshot.data[str.key];
        if (value == null) {
          return null;
        }

        return {
          version: snapshot.version,
          value,
          createdAt: snapshot.createdAt,
          createdBy: { id: session.user.id, name: session.user.name },
        };
      });

      return acc.set(locale, {
        versions,
        totalVersions,
        hasMore: offset + versions.length < totalVersions,
      });
    }, new Map<string, PaginatedSnapshotVersions>());
  };

  getDraftDataForLocales = async (
    project: Project,
    locales: string[],
  ): Promise<Map<string, Record<string, string>>> => {
    const session = await verifySessionIsSet(this.context);
    assert(session.user.id === project.userId, 'Should have been called with the user that owns the project');

    if (locales.length === 0) {
      return new Map();
    }

    const allTranslations = await getDrizzle(this.context)
      .select({ key: strings.key, value: translations.value, locale: translations.locale })
      .from(strings)
      .innerJoin(translations, and(eq(translations.stringId, strings.id), inArray(translations.locale, locales)))
      .where(eq(strings.projectId, project.id));

    return allTranslations.reduce(
      (result, row) => result.set(row.locale, { ...result.get(row.locale), [row.key]: row.value }),
      new Map<string, Record<string, string>>(),
    );
  };

  getLatestSnapshots = async (project: Project, locales: string[]): Promise<Map<string, TranslationSnapshot>> => {
    const session = await verifySessionIsSet(this.context);
    assert(session.user.id === project.userId, 'Should have been called with the user that owns the project');

    if (locales.length === 0) {
      return new Map();
    }

    const db = getDrizzle(this.context);
    const latestVersions = await db
      .select({ locale: translationSnapshots.locale, maxVersion: sql<number>`MAX(${translationSnapshots.version})` })
      .from(translationSnapshots)
      .where(and(eq(translationSnapshots.projectId, project.id), inArray(translationSnapshots.locale, locales)))
      .groupBy(translationSnapshots.locale);
    if (latestVersions.length === 0) {
      return new Map();
    }

    const snapshots = await db
      .select()
      .from(translationSnapshots)
      .where(
        and(
          eq(translationSnapshots.projectId, project.id),
          or(
            ...latestVersions.map(v =>
              and(eq(translationSnapshots.locale, v.locale), eq(translationSnapshots.version, v.maxVersion)),
            ),
          ),
        ),
      );

    return snapshots.reduce(
      (map, snapshot) => map.set(snapshot.locale, dbTranslationSnapshotToModel(snapshot)),
      new Map<string, TranslationSnapshot>(),
    );
  };

  createSnapshots = async (project: Project, locales: string[]): Promise<Map<string, TranslationSnapshot>> => {
    const session = await verifySessionIsSet(this.context);
    assert(session.user.id === project.userId, 'Should have been called with the user that owns the project');

    if (locales.length === 0) {
      return new Map();
    }

    const db = getDrizzle(this.context);
    const translationsByLocale = await this.getDraftDataForLocales(project, locales);
    const versionRows = await db
      .select({
        locale: translationSnapshots.locale,
        maxVersion: sql<number>`COALESCE(MAX(${translationSnapshots.version}), 0)`,
      })
      .from(translationSnapshots)
      .where(and(eq(translationSnapshots.projectId, project.id), inArray(translationSnapshots.locale, locales)))
      .groupBy(translationSnapshots.locale);
    const versionMap = new Map(versionRows.map(row => [row.locale, row.maxVersion]));
    const result = locales.reduce<Map<string, TranslationSnapshot>>((result, locale) => {
      const nextVersion = (versionMap.get(locale) ?? 0) + 1;
      const data = translationsByLocale.get(locale);
      assert(data, 'Data should exist for locale');

      return result.set(
        locale,
        newTranslationSnapshot({
          projectId: project.id,
          locale,
          version: nextVersion,
          data,
          id: null,
        }),
      );
    }, new Map());
    if (result.size > 0) {
      await db.insert(translationSnapshots).values(Array.from(result.values()));
    }

    return result;
  };
}

export default SnapshotsRepositoryImpl;
