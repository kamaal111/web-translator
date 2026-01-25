import { ResponseError } from '@/generated/api-client/src';
import { isWithinRange } from './numbers';

export function is4xxError(err: unknown): boolean {
  if (!(err instanceof ResponseError)) {
    return false;
  }

  return isWithinRange(err.response.status, { min: 400, max: 499 });
}
