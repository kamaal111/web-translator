import type { Context, Input, Next } from 'hono';
import type { RequestIdVariables } from 'hono/request-id';

import { PostgresDatabase, type Database } from './db';
import { auth, type Auth } from './auth';

export interface InjectedContext {
  db: Database;
  auth: Auth;
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

export function injectRequestContext(injects?: Partial<InjectedContext>) {
  return async (c: HonoContext, next: Next) => {
    c.set('db', injects?.db ?? new PostgresDatabase());
    c.set('auth', injects?.auth ?? auth);
    await next();
  };
}
