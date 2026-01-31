import assert from 'node:assert';

import { and, desc, eq, sql } from 'drizzle-orm';

import { strings, translations, translationSnapshots } from '../../../db/schema';
import type { HonoContext } from '../../../context';
import { getDrizzle } from '../../../context/database';
import type { SnapshotsRepository } from './types';
import { verifySessionIsSet } from '../../../auth/utils/session';
import type Project from '../../../projects/models/project';
import type TranslationSnapshot from './models';
import { dbTranslationSnapshotToModel } from './mappers';
import { newTranslationSnapshot, type ITranslationSnapshot } from './models';

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
}

export default SnapshotsRepositoryImpl;
