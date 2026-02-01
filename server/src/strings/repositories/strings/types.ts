import type Project from '../../../projects/models/project';
import type StringModel from '../../models/string';

export type TranslationEntry = {
  key: string;
  context?: string | null;
  translations: Record<string, string>;
};

/**
 * Draft translation information with author details
 */
export interface DraftWithAuthor {
  locale: string;
  value: string;
  updatedAt: Date;
  updatedBy: {
    id: string;
    name: string;
  };
}

export interface StringsRepository {
  list: (project: Project) => Promise<StringModel[]>;

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
}
