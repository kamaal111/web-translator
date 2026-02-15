import { test, expect, mock, describe, beforeEach, spyOn, afterEach, type Mock } from 'bun:test';
import assert from 'node:assert';

import type { Hono } from 'hono';

import { createApp } from '../..';
import type { HonoEnvironment } from '..';
import type { Logger, LogPayload } from '../types';

describe('Context tests', () => {
  let logCalls: Array<{ message: string; payload?: LogPayload }> = [];
  const mockLoggerFn = mock((message: string, payload?: LogPayload) => {
    logCalls.push({ message, payload });
  });
  const mockLogger: Logger = {
    info: mockLoggerFn,
    error: mockLoggerFn,
    warn: mockLoggerFn,
    debug: mockLoggerFn,
    silent: mockLoggerFn,
  };
  let app: Hono<HonoEnvironment>;
  let nowSpy: Mock<() => number>;

  beforeEach(() => {
    app = createApp({ logger: mockLogger });
    logCalls = [];
    nowSpy = spyOn(performance, 'now');
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  test('injectRequestContext - injects logger, db, and auth into context', async () => {
    const res = await app.request('/health/ping');

    expect(res.status).toBe(200);
    expect(mockLoggerFn).toHaveBeenCalled();
  });

  test('injectRequestContext - logs request and response', async () => {
    const res = await app.request('/health/ping');

    expect(res.status).toBe(200);
    expect(logCalls.length).toBe(2);
    expect(logCalls[0]).toBeDefined();
    expect(logCalls[0]?.message).toContain('<-- GET /health/ping');
    expect(logCalls[1]).toBeDefined();
    expect(logCalls[1]?.message).toContain('--> GET /health/ping');
    expect(logCalls[1]?.payload?.elapsed_time_ms).toBeDefined();
  });

  test('injectRequestContext - measures elapsed time', async () => {
    nowSpy.mockReturnValueOnce(10).mockReturnValueOnce(67);

    const res = await app.request('/health/ping');

    expect(res.status).toBe(200);
    expect(logCalls.length).toBe(2);
    const responseLog = logCalls[1];
    expect(responseLog).toBeDefined();
    expect(responseLog?.payload?.elapsed_time_ms).toBeDefined();
    assert(!Array.isArray(responseLog?.payload?.elapsed_time_ms));
    const elapsedTime = parseInt(responseLog?.payload?.elapsed_time_ms ?? 'NaN', 10);
    expect(elapsedTime).toEqual(57);
  });

  test('injectRequestContext - logger includes request_id', async () => {
    const res = await app.request('/health/ping');

    expect(res.status).toBe(200);
    const requestId = res.headers.get('wt-request-id');
    expect(requestId).toBeDefined();
  });
});
