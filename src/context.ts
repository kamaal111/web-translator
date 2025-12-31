import type { Context, Input } from 'hono';
import type { RequestIdVariables } from 'hono/request-id';

type HonoVariables = RequestIdVariables;

export interface HonoEnvironment {
  Variables: HonoVariables;
}

export type HonoContext<P extends string = string, I extends Input = Record<string, unknown>> = Context<
  HonoEnvironment,
  P,
  I
>;
