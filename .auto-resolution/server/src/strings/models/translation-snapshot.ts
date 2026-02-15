import type { Optional, ReplaceValue } from '../../utils/typing';

export type ITranslationSnapshot = {
  id: string;
  projectId: string;
  locale: string;
  version: number;
  data: Record<string, string>;
};

type TranslationSnapshotArguments = ReplaceValue<ITranslationSnapshot, 'id', Optional<ITranslationSnapshot['id']>>;

class TranslationSnapshot implements ITranslationSnapshot {
  id: string;
  projectId: string;
  locale: string;
  version: number;
  data: Record<string, string>;

  private readonly __brand!: void;

  constructor(params: TranslationSnapshotArguments) {
    this.id = params.id || Bun.randomUUIDv7();
    this.projectId = params.projectId;
    this.locale = params.locale;
    this.version = params.version;
    this.data = params.data;
  }

  get sortedDataKeys(): string[] {
    return Object.keys(this.data).sort();
  }
}

export function newTranslationSnapshot(params: TranslationSnapshotArguments) {
  return new TranslationSnapshot(params);
}

export default TranslationSnapshot;
