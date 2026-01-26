import type StringModel from './models/string';
import type { StringResponse } from './schemas';

export function dbStringToResponse(str: StringModel): StringResponse {
  return {
    id: str.id,
    key: str.key,
    context: str.context,
    project_id: str.projectId,
  };
}
