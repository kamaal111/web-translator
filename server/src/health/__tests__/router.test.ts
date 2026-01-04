import { test, expect } from 'bun:test';

import { createApp } from '../..';

const app = createApp();

test('GET /ping', async () => {
  const res = await app.request('/health/ping');

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ message: 'PONG' });
});

test('GET /pings (invalid route) returns 404', async () => {
  const res = await app.request('/health/pings');

  expect(res.status).toBe(404);
});
