import type Project from '../../../projects/models/project';
import type StringModel from '../../models/string';
import type DraftWithAuthor from '../../models/draft-with-author';

export type TranslationEntry = {
  key: string;
  context?: string | null;
  translations: Record<string, string>;
};

export interface StringsRepository {
  /**
   * Lists every string for a project together with its current draft translations.
   *
   * @param project The project whose strings should be loaded.
   * @returns All strings in the project paired with a locale-to-value translation map.
   */
  listWithTranslations: (
    project: Project,
  ) => Promise<Array<{ string: StringModel; translations: Map<string, string> }>>;

  /**
   * Creates missing strings, updates existing string context values, and upserts
   * the provided draft translations in a single batch operation.
   *
   * @param project The project that owns the strings being updated.
   * @param entries The string entries and locale values to insert or update.
   * @returns The number of translation rows that were created or changed.
   */
  upsertTranslations: (project: Project, entries: TranslationEntry[]) => Promise<{ updatedCount: number }>;

  /**
   * Deletes a string by key from a project.
   *
   * @param project The project that owns the string.
   * @param key The translation key to delete.
   * @returns `true` when a string was deleted, otherwise `false`.
   */
  deleteByKey: (project: Project, key: string) => Promise<boolean>;

  /**
   * Finds a single string in a project by its translation key.
   *
   * @param project The project that owns the string.
   * @param key The translation key to look up.
   * @returns The matching string model, or `null` when no string exists for the key.
   */
  findByKey: (project: Project, key: string) => Promise<StringModel | null>;

  /**
   * Gets the locales that currently have draft translations for a string.
   *
   * @param str The string whose draft locales should be queried.
   * @param locale Optional locale filter to restrict the lookup to a single locale.
   * @returns A set containing the locales that currently have draft translations.
   */
  getDraftTranslationsLocales: (str: StringModel, locale?: string) => Promise<Set<string>>;

  /**
   * Gets draft translations for a string across multiple locales, including author metadata.
   *
   * @param str The string whose draft translations should be fetched.
   * @param locales The locales to load draft translations for.
   * @returns A map keyed by locale containing the matching draft translation data.
   */
  getDraftTranslationsForLocales: (str: StringModel, locales: string[]) => Promise<Map<string, DraftWithAuthor>>;

  /**
   * Updates one or more draft translations for an existing string.
   *
   * @param project The project that owns the string being updated.
   * @param stringRecord The string whose draft translations should be updated.
   * @param translationsMap A locale-to-value map of draft translations to write.
   * @param ifUnmodifiedSince Optional optimistic concurrency timestamp used to detect conflicts.
   * @returns The updated draft translations including author and timestamp metadata.
   */
  updateDraft: (
    project: Project,
    stringRecord: StringModel,
    translationsMap: Record<string, string>,
    ifUnmodifiedSince?: Date,
  ) => Promise<DraftWithAuthor[]>;
}
