import type { Context, Input, Next } from 'hono';
import type { RequestIdVariables } from 'hono/request-id';

import type { Database } from './db';

interface InjectedContext {
  db: Database;
}

type HonoVariables = RequestIdVariables & InjectedContext;

export interface HonoEnvironment {
  Variables: HonoVariables;
}

export type HonoContext<I extends Input = Record<string, unknown>, P extends string = string> = Context<
  HonoEnvironment,
  P,
  I
>;

export function injectRequestContext({ db }: InjectedContext) {
  return async (c: HonoContext, next: Next) => {
    c.set('db', db);
    await next();
  };
}
