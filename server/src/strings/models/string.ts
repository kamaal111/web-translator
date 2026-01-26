import type { ReplaceValue } from '../../utils/typing';

export type IString = {
  id: string;
  key: string;
  context: string | null;
  projectId: string;
};

type StringArguments = ReplaceValue<IString, 'id', IString['id'] | null | undefined>;

class StringModel implements IString {
  id: string;
  key: string;
  context: string | null;
  projectId: string;

  constructor(params: StringArguments) {
    this.id = params.id || Bun.randomUUIDv7();
    this.key = params.key;
    this.context = params.context;
    this.projectId = params.projectId;
  }
}

export function newString(args: StringArguments) {
  return new StringModel(args);
}

export default StringModel;
