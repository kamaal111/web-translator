import type { translationSnapshots } from '../../../db/schema/translation-snapshots';
import type TranslationSnapshot from './models';
import { newTranslationSnapshot } from './models';

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
