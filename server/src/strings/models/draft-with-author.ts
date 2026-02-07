import type { Optional, ReplaceValues } from '../../utils/typing';

export type IDraftWithAuthor = {
  locale: string;
  value: string;
  updatedAt: Date;
  updatedBy: {
    id: string;
    name: string;
  };
};

type DraftWithAuthorArguments = ReplaceValues<
  IDraftWithAuthor,
  {
    updatedAt: Optional<IDraftWithAuthor['updatedAt']>;
  }
>;

class DraftWithAuthor implements IDraftWithAuthor {
  locale: string;
  value: string;
  updatedAt: Date;
  updatedBy: {
    id: string;
    name: string;
  };

  private readonly __brand!: void;

  constructor(params: DraftWithAuthorArguments) {
    this.locale = params.locale;
    this.value = params.value;
    this.updatedAt = params.updatedAt ?? new Date();
    this.updatedBy = params.updatedBy;
  }
}

export function newDraftWithAuthor(args: DraftWithAuthorArguments) {
  return new DraftWithAuthor(args);
}

export default DraftWithAuthor;
