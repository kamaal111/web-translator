import type { HonoContext } from '../context';

function logConstructor(c: HonoContext, str: string, ...rest: string[]) {
  return [c.get('requestId'), str, rest.join('')].join(' ');
}

export function logger(c: HonoContext, str: string, ...rest: string[]) {
  console.log(logConstructor(c, str, ...rest));
}
