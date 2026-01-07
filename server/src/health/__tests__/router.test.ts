import { test, expect, beforeAll, afterAll } from 'bun:test';

import TestHelper from '../../__tests__/test-helper';

const helper = new TestHelper();

beforeAll(helper.beforeAll);

afterAll(helper.afterAll);

test('GET /ping', async () => {
  const res = await helper.app.request('/health/ping');

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ message: 'PONG' });
});

test('GET /pings (invalid route) returns 404', async () => {
  const res = await helper.app.request('/health/pings');

  expect(res.status).toBe(404);
});
