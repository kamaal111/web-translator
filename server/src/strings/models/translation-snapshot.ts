export type ITranslationSnapshot = {
  id: string;
  projectId: string;
  locale: string;
  version: number;
  data: Record<string, string>;
};

class TranslationSnapshot implements ITranslationSnapshot {
  id: string;
  projectId: string;
  locale: string;
  version: number;
  data: Record<string, string>;

  private readonly __brand!: void;

  constructor(params: ITranslationSnapshot) {
    this.id = params.id;
    this.projectId = params.projectId;
    this.locale = params.locale;
    this.version = params.version;
    this.data = params.data;
  }
}

export function newTranslationSnapshot(params: ITranslationSnapshot) {
  return new TranslationSnapshot(params);
}

export default TranslationSnapshot;
