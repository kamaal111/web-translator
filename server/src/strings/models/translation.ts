import type { Optional, ReplaceValues } from '../../utils/typing';

interface ITranslation {
  id: string;
  stringId: string;
  locale: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

type TranslationArguments = ReplaceValues<
  ITranslation,
  {
    id: Optional<ITranslation['id']>;
    createdAt: Optional<ITranslation['createdAt']>;
    updatedAt: Optional<ITranslation['createdAt']>;
  }
>;

class Translation implements ITranslation {
  id: string;
  stringId: string;
  locale: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;

  private readonly __brand!: void;

  constructor(params: TranslationArguments) {
    const now = new Date();
    this.id = params.id || Bun.randomUUIDv7();
    this.stringId = params.stringId;
    this.locale = params.locale;
    this.value = params.value;
    this.createdAt = params.createdAt ?? now;
    this.updatedAt = params.updatedAt ?? now;
  }
}

export function newTranslation(args: TranslationArguments) {
  return new Translation(args);
}

export default Translation;
