import { test, expect } from "bun:test";

import app from "./src/index.ts";

test("GET / returns Hello Hono!", async () => {
  const res = await app.request("/");
  expect(res.status).toBe(200);
  expect(await res.text()).toBe("Hello Hono!");
});
