import type { Context, Input, Next } from 'hono';
import type { RequestIdVariables } from 'hono/request-id';
import pino from 'pino';

import { PostgresDatabase, type Database } from '../db';
import { auth, type Auth } from '../auth';
import env from '../env';
import { getLogger } from './logging';
import type { Logger } from './types';
import packageJson from '../../package.json';
import { getLogEvents } from './events';

export interface InjectedContext {
  db: Database;
  auth: Auth;
  logger: Logger;
  logEvents: Record<string, Record<string, string>>[];
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

const { DEBUG, LOG_LEVEL } = env;

const pinoLogger = pino({
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

function defaultLogger(c: HonoContext): Logger {
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

    return payload;
  };

  return {
    info: (message: string, payload?: Record<string, string>) => {
      pinoLogger.info({ ...basePayload(c), ...payload }, message);
    },
    error: (message: string, payload?: Record<string, string>) => {
      pinoLogger.error({ ...basePayload(c), ...payload }, message);
    },
    warn: (message: string, payload?: Record<string, string>) => {
      pinoLogger.warn({ ...basePayload(c), ...payload }, message);
    },
    debug: (message: string, payload?: Record<string, string>) => {
      pinoLogger.debug({ ...basePayload(c), ...payload }, message);
    },
  };
}

function logEvents(c: HonoContext) {
  for (const logEvent of getLogEvents(c)) {
    for (const [key, log] of Object.entries(logEvent)) {
      getLogger(c).info(`Event - ${key}`, log);
    }
  }
}

export function injectRequestContext(injects?: Partial<InjectedContext>) {
  return async (c: HonoContext, next: Next) => {
    const startTime = performance.now();
    c.set('logEvents', []);
    c.set('logger', injects?.logger ?? defaultLogger(c));
    getLogger(c).info(`<-- ${c.req.method} ${c.req.path}`);
    c.set('db', injects?.db ?? new PostgresDatabase());
    c.set('auth', injects?.auth ?? auth);
    await next();
    logEvents(c);
    const elapsedTimeInMs = Math.floor(performance.now() - startTime);
    getLogger(c).info(`--> ${c.req.method} ${c.req.path}`, { elapsed_time_ms: elapsedTimeInMs.toString() });
  };
}
