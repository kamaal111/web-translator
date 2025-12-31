import { test, expect } from 'bun:test';

import app from '../../..';

test('GET / ping', async () => {
  const res = await app.request('/health/ping');

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ message: 'PONG' });
});
