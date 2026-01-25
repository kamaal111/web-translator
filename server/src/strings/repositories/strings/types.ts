import type { IString } from '../../models/string';
import type StringModel from '../../models/string';

export type { StringsRepository };

export type TranslationEntry = {
  key: string;
  context?: string | null;
  translations: Record<string, string>;
};

interface StringsRepository {
  createString: (payload: Omit<IString, 'id'>) => Promise<StringModel>;

  list: (projectId: string) => Promise<StringModel[]>;

  read: (id: string) => Promise<StringModel | null>;

  getTranslationsForLocale: (
    projectId: string,
    locale: string,
  ) => Promise<Array<{ key: string; value: string | null; context: string | null }>>;

  upsertTranslations: (projectId: string, entries: TranslationEntry[]) => Promise<{ updatedCount: number }>;
}
