import assert from 'node:assert';

import { and, desc, eq, sql } from 'drizzle-orm';

import { strings, translations, translationSnapshots } from '../../../db/schema';
import type { HonoContext } from '../../../context';
import { getSession } from '../../../context/session';
import { getDrizzle } from '../../../context/database';
import type { SessionResponse } from '../../../auth';
import type { SnapshotsRepository, TranslationSnapshot } from './types';

class SnapshotsRepositoryImpl implements SnapshotsRepository {
  private readonly context: HonoContext;

  constructor(params: { context: HonoContext }) {
    this.context = params.context;
  }

  getSnapshot = async (projectId: string, locale: string, version: number): Promise<TranslationSnapshot | null> => {
    // Public endpoint - no auth required
    const result = await getDrizzle(this.context)
      .select()
      .from(translationSnapshots)
      .where(
        and(
          eq(translationSnapshots.projectId, projectId),
          eq(translationSnapshots.locale, locale),
          eq(translationSnapshots.version, version),
        ),
      )
      .limit(1);

    const row = result[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      projectId: row.projectId,
      locale: row.locale,
      version: row.version,
      data: row.data,
      createdAt: row.createdAt,
    };
  };

  getLatestSnapshot = async (projectId: string, locale: string): Promise<TranslationSnapshot | null> => {
    // Public endpoint - no auth required
    // Uses the (project_id, locale) index with ORDER BY version DESC LIMIT 1
    const result = await getDrizzle(this.context)
      .select()
      .from(translationSnapshots)
      .where(and(eq(translationSnapshots.projectId, projectId), eq(translationSnapshots.locale, locale)))
      .orderBy(desc(translationSnapshots.version))
      .limit(1);

    const row = result[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      projectId: row.projectId,
      locale: row.locale,
      version: row.version,
      data: row.data,
      createdAt: row.createdAt,
    };
  };

  createSnapshot = async (projectId: string, locale: string): Promise<TranslationSnapshot> => {
    this.getSession(); // Verify user is authenticated

    const drizzle = getDrizzle(this.context);

    // Get the next version number (max + 1, or 1 if none exist)
    const versionResult = await drizzle
      .select({ maxVersion: sql<number>`COALESCE(MAX(${translationSnapshots.version}), 0)` })
      .from(translationSnapshots)
      .where(and(eq(translationSnapshots.projectId, projectId), eq(translationSnapshots.locale, locale)));

    const versionRow = versionResult[0];
    assert(versionRow, 'SQL COALESCE should always return a row');
    const nextVersion = versionRow.maxVersion + 1;

    // Get current translations for this project/locale
    const currentTranslations = await drizzle
      .select({
        key: strings.key,
        value: translations.value,
      })
      .from(strings)
      .innerJoin(translations, and(eq(translations.stringId, strings.id), eq(translations.locale, locale)))
      .where(eq(strings.projectId, projectId));

    // Build the data object
    const data: Record<string, string> = {};
    for (const row of currentTranslations) {
      data[row.key] = row.value;
    }

    // Insert the new snapshot
    const now = new Date();
    const snapshot: TranslationSnapshot = {
      id: Bun.randomUUIDv7(),
      projectId,
      locale,
      version: nextVersion,
      data,
      createdAt: now,
    };

    await drizzle.insert(translationSnapshots).values({
      id: snapshot.id,
      projectId: snapshot.projectId,
      locale: snapshot.locale,
      version: snapshot.version,
      data: snapshot.data,
      createdAt: snapshot.createdAt,
    });

    return snapshot;
  };

  private getSession = (): SessionResponse => {
    const session = getSession(this.context);
    assert(session != null, 'This function should have been called with an authorized request');

    return session;
  };
}

export default SnapshotsRepositoryImpl;
