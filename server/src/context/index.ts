import type { Context, Input, Next } from 'hono';
import type { RequestIdVariables } from 'hono/request-id';
import pino from 'pino';

import { createDrizzleDatabase, DrizzleClient, type Database, type DrizzleDatabase } from '../db';
import { type Auth, type SessionResponse, createAuth } from '../auth';
import env from '../env';
import { getLogger } from './logging';
import type { Logger } from './types';
import packageJson from '../../package.json';
import { getSession } from './session';

export interface InjectedContext {
  drizzle: DrizzleDatabase;
  logger: Logger;
}

interface StateContext {
  session?: SessionResponse;
  db: Database;
  auth: Auth;
  logEvents: Record<string, Record<string, string>>[];
}

export type HonoVariables = RequestIdVariables & InjectedContext & StateContext;

export interface HonoEnvironment {
  Variables: HonoVariables;
}

export type HonoContext<I extends Input = Record<string, unknown>, P extends string = string> = Context<
  HonoEnvironment,
  P,
  I
>;

export type GetHonoContextVar<Key extends keyof HonoContext['var']> = HonoContext['var'][Key];

const { DEBUG, LOG_LEVEL } = env;

const defaultPinoLogger = pino({
  level: LOG_LEVEL,
  transport: DEBUG
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
const defaultDrizzleDatabase = createDrizzleDatabase();

function makeDefaultLogger(c: HonoContext): Logger {
  const basePayload = (c: HonoContext) => {
    const payload: Record<string, string> = {
      request_id: c.get('requestId'),
      method: c.req.method,
      path: c.req.path,
      url: c.req.url,
      version: packageJson.version,
      service_name: packageJson.name,
    };

    if (c.finalized) {
      payload.status = c.res.status.toString();
    }

    const session = getSession(c);
    if (session != null) {
      payload.user_id = session.user.id;
      payload.user_email_verified = String(session.user.email_verified);
    }

    return payload;
  };

  return {
    info: (message: string, payload?: Record<string, string>) => {
      defaultPinoLogger.info({ ...basePayload(c), ...payload }, message);
    },
    error: (message: string, payload?: Record<string, string>) => {
      defaultPinoLogger.error({ ...basePayload(c), ...payload }, message);
    },
    warn: (message: string, payload?: Record<string, string>) => {
      defaultPinoLogger.warn({ ...basePayload(c), ...payload }, message);
    },
    debug: (message: string, payload?: Record<string, string>) => {
      defaultPinoLogger.debug({ ...basePayload(c), ...payload }, message);
    },
    silent: (message: string, payload?: Record<string, string>) => {
      defaultPinoLogger.silent({ ...basePayload(c), ...payload }, message);
    },
  };
}

export function injectRequestContext(injects?: Partial<InjectedContext>) {
  return async (c: HonoContext, next: Next) => {
    const startTime = performance.now();
    c.set('logEvents', []);
    c.set('logger', injects?.logger ?? makeDefaultLogger(c));
    getLogger(c).info(`<-- ${c.req.method} ${c.req.path}`);
    c.set('drizzle', injects?.drizzle ?? defaultDrizzleDatabase);
    c.set('db', new DrizzleClient({ context: c }));
    c.set('auth', createAuth(c));
    await next();
    const elapsedTimeInMs = Math.floor(performance.now() - startTime);
    getLogger(c).info(`--> ${c.req.method} ${c.req.path}`, { elapsed_time_ms: elapsedTimeInMs.toString() });
  };
}
