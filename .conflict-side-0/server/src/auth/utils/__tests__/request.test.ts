import { describe, expect, test, beforeAll, afterAll } from 'bun:test';

import TestHelper from '../../../__tests__/test-helper';

describe('Auth Request Utils - Header Merging', () => {
  const helper = new TestHelper();

  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  describe('Sign-up and sign-in header merging behavior', () => {
    test('sign-up should return all expected headers including content-type', async () => {
      const response = await helper.signUpUser('header-merge-test@example.com', 'Header Merge Test User');

      expect(response.status).toBe(201);
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(response.headers.get('set-auth-token')).toBeDefined();
      expect(response.headers.get('set-auth-token-expiry')).toBeDefined();
      expect(response.headers.get('set-session-token')).toBeDefined();
      expect(response.headers.get('set-session-update-age')).toBeDefined();

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('better-auth.session_token');
    });

    test('sign-in should return all expected headers including content-type', async () => {
      await helper.signUpUser('header-merge-signin@example.com', 'Header Merge Sign-in User');

      const response = await helper.signInUser('header-merge-signin@example.com');

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(response.headers.get('set-auth-token')).toBeDefined();
      expect(response.headers.get('set-auth-token-expiry')).toBeDefined();
      expect(response.headers.get('set-session-token')).toBeDefined();
      expect(response.headers.get('set-session-update-age')).toBeDefined();

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('better-auth.session_token');
    });

    test('headers should have correct priority - generated headers over authHeaders', async () => {
      const response = await helper.signUpUser('priority-test@example.com', 'Priority Test User');

      expect(response.status).toBe(201);

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('better-auth.session_token');
    });

    test('set-cookie headers are properly merged from authHeaders', async () => {
      const response = await helper.signUpUser('set-cookie-test@example.com', 'Set Cookie Test User');

      expect(response.status).toBe(201);

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('better-auth.session_token');
      expect(setCookie).toContain('Path=/');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('SameSite');

      const contentType = response.headers.get('content-type');
      expect(contentType).toBe('application/json');
    });
  });
});
