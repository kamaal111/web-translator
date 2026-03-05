import type { Optional, ReplaceValues } from '../../utils/typing';

export type IString = {
  id: string;
  key: string;
  context: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
};

type StringArguments = ReplaceValues<
  IString,
  {
    id: Optional<IString['id']>;
    createdAt: Optional<IString['createdAt']>;
    updatedAt: Optional<IString['createdAt']>;
  }
>;

class StringModel implements IString {
  id: string;
  key: string;
  context: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;

  private readonly __brand!: void;

  constructor(params: StringArguments) {
    const now = new Date();
    this.id = params.id || Bun.randomUUIDv7();
    this.key = params.key;
    this.context = params.context;
    this.projectId = params.projectId;
    this.createdAt = params.createdAt ?? now;
    this.updatedAt = params.updatedAt ?? now;
  }
}

export function newString(args: StringArguments) {
  return new StringModel(args);
}

export default StringModel;
