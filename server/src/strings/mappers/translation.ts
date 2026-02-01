import type { translations } from '../../db/schema';
import type Translation from '../models/translation';

export function translationModelToDbInsert(translation: Translation): typeof translations.$inferInsert {
  return {
    id: translation.id,
    stringId: translation.stringId,
    locale: translation.locale,
    value: translation.value,
    createdAt: translation.createdAt,
    updatedAt: translation.updatedAt,
  };
}
