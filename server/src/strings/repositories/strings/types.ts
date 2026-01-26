import type Project from '../../../projects/models/project';
import type StringModel from '../../models/string';

export type TranslationEntry = {
  key: string;
  context?: string | null;
  translations: Record<string, string>;
};

export interface StringsRepository {
  list: (project: Project) => Promise<StringModel[]>;

  upsertTranslations: (project: Project, entries: TranslationEntry[]) => Promise<{ updatedCount: number }>;
}
