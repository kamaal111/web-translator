import type { translationSnapshots } from '../../db/schema';
import TranslationSnapshot, { newTranslationSnapshot } from '../models/translation-snapshot';

export function dbTranslationSnapshotToModel(
  dbTranslationSnapshot: typeof translationSnapshots.$inferInsert,
): TranslationSnapshot {
  return newTranslationSnapshot({
    id: dbTranslationSnapshot.id,
    projectId: dbTranslationSnapshot.projectId,
    locale: dbTranslationSnapshot.locale,
    version: dbTranslationSnapshot.version,
    data: dbTranslationSnapshot.data,
  });
}
