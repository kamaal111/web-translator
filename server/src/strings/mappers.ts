import type { IString } from './models/string';

export function mapDbStringToModel(dbString: {
  id: string;
  key: string;
  context: string | null;
  projectId: string;
}): IString {
  return {
    id: dbString.id,
    key: dbString.key,
    context: dbString.context,
    projectId: dbString.projectId,
  };
}
