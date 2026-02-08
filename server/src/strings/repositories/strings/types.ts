import type Project from '../../../projects/models/project';
import type StringModel from '../../models/string';
import type DraftWithAuthor from '../../models/draft-with-author';

export type TranslationEntry = {
  key: string;
  context?: string | null;
  translations: Record<string, string>;
};

export interface StringsRepository {
  listWithTranslations: (
    project: Project,
  ) => Promise<Array<{ string: StringModel; translations: Map<string, string> }>>;

  upsertTranslations: (project: Project, entries: TranslationEntry[]) => Promise<{ updatedCount: number }>;

  /**
   * Find a string by project and key
   */
  findByKey: (project: Project, key: string) => Promise<StringModel | null>;

  /**
   * Get draft translations locales for a string.
   * Optionally filter by locale.
   */
  getDraftTranslationsLocales: (str: StringModel, locale?: string) => Promise<Set<string>>;

  /**
   * Get draft translations for a string across multiple locales with author information.
   * Returns a map of locale -> DraftWithAuthor.
   */
  getDraftTranslationsForLocales: (str: StringModel, locales: string[]) => Promise<Map<string, DraftWithAuthor>>;

  /**
   * Update draft translations for a string.
   * Optionally check for conflicts using ifUnmodifiedSince timestamp.
   * Returns the updated translations with author information.
   */
  updateDraft: (
    project: Project,
    stringRecord: StringModel,
    translationsMap: Record<string, string>,
    ifUnmodifiedSince?: Date,
  ) => Promise<DraftWithAuthor[]>;
}
