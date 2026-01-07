import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import path from 'node:path';

import { APP_API_BASE_PATH } from '../../constants/common';
import { ROUTE_NAME } from '../constants';
import TestHelper from '../../__tests__/test-helper';

const BASE_PATH = path.join(APP_API_BASE_PATH, ROUTE_NAME);

describe('Auth Router Integration Tests', () => {
  const helper = new TestHelper();

  beforeAll(helper.beforeAll);

  afterAll(helper.afterAll);

  describe('POST /sign-up/email', () => {
    test('should successfully register a new user', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as { token: string };
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe('string');

      const authHeader = response.headers.get('set-auth-token');
      expect(authHeader).toBeDefined();
    });

    test('should reject duplicate email', async () => {
      // First signup
      await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'First User',
        }),
      });

      // Attempt duplicate signup
      const response = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'Password456!',
          name: 'Second User',
        }),
      });

      expect(response.status).toBe(409);
      const data = (await response.json()) as { message: string };
      expect(data.message).toBeDefined();
    });

    test('should reject invalid email format', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(400);
    });

    test('should reject short password', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test2@example.com',
          password: 'short',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(400);
    });

    test('should accept name after trimming spaces', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test3@example.com',
          password: 'Password123!',
          name: '  Spaced Name  ',
        }),
      });

      expect(response.status).toBe(201);
    });
  });

  describe('POST /sign-in/email', () => {
    const testUser = {
      email: 'signin@example.com',
      password: 'SignInPassword123!',
      name: 'Sign In User',
    };

    beforeAll(async () => {
      // Create a test user
      await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });
    });

    test('should successfully sign in existing user', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as { token: string };
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe('string');

      // Verify JWT token is in header
      const authHeader = response.headers.get('set-auth-token');
      expect(authHeader).toBeDefined();
    });

    test('should reject incorrect password', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword123!',
        }),
      });

      expect(response.status).toBe(401);
    });

    test('should reject non-existent user', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        }),
      });

      expect(response.status).toBe(401);
    });

    test('should reject invalid email format', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'Password123!',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /sign-out', () => {
    let sessionToken: string;

    beforeAll(async () => {
      // Create user and sign in to get a session token
      const signUpResponse = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'signout@example.com',
          password: 'SignOutPassword123!',
          name: 'Sign Out User',
        }),
      });

      const data = (await signUpResponse.json()) as { token: string };
      sessionToken = data.token;
    });

    test('should successfully sign out user', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      expect(response.status).toBe(204);
    });

    test('should handle sign out without token', async () => {
      const response = await helper.app.request(`${BASE_PATH}/sign-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Returns 204 even without token (graceful handling)
      expect(response.status).toBe(204);
    });
  });

  describe('GET /session', () => {
    let sessionToken: string;

    beforeAll(async () => {
      // Create user and sign in to get a session token
      const signUpResponse = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'session@example.com',
          password: 'SessionPassword123!',
          name: 'Session User',
        }),
      });

      const data = (await signUpResponse.json()) as { token: string };
      sessionToken = data.token;
    });

    test('should retrieve current session with valid token', async () => {
      const response = await helper.app.request(`${BASE_PATH}/session`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as { session: unknown; user: { email: string } };
      expect(data.session).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('session@example.com');
    });

    test('should return 404 without token', async () => {
      const response = await helper.app.request(`${BASE_PATH}/session`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
    });

    test('should return 404 with invalid token', async () => {
      const response = await helper.app.request(`${BASE_PATH}/session`, {
        method: 'GET',
        headers: { Authorization: 'Bearer invalid_token_here' },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /token', () => {
    let sessionToken: string;

    beforeAll(async () => {
      // Create user and sign in to get a session token
      const signUpResponse = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'token@example.com',
          password: 'TokenPassword123!',
          name: 'Token User',
        }),
      });

      const data = (await signUpResponse.json()) as { token: string };
      sessionToken = data.token;
    });

    test('should retrieve JWT token with valid session', async () => {
      const response = await helper.app.request(`${BASE_PATH}/token`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as { token: string };
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe('string');
    });

    test('should return 404 without token', async () => {
      const response = await helper.app.request(`${BASE_PATH}/token`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /jwks', () => {
    test('should return JWKS public keys', async () => {
      const response = await helper.app.request(`${BASE_PATH}/jwks`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as { keys: unknown[] };
      expect(data.keys).toBeDefined();
      expect(Array.isArray(data.keys)).toBe(true);
    });

    test('should not require authentication', async () => {
      // JWKS endpoint should be public
      const response = await helper.app.request(`${BASE_PATH}/jwks`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Full Auth Flow', () => {
    test('should complete sign-up, sign-in, session check, and sign-out flow', async () => {
      // 1. Sign up
      const signUpResponse = await helper.app.request(`${BASE_PATH}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'flow@example.com',
          password: 'FlowPassword123!',
          name: 'Flow User',
        }),
      });

      expect(signUpResponse.status).toBe(201);
      const signUpData = (await signUpResponse.json()) as { token: string };
      const token1 = signUpData.token;

      // 2. Check session
      const sessionResponse = await helper.app.request(`${BASE_PATH}/session`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token1}` },
      });

      expect(sessionResponse.status).toBe(200);
      const sessionData = (await sessionResponse.json()) as { user: { email: string } };
      expect(sessionData.user.email).toBe('flow@example.com');

      // 3. Sign out
      const signOutResponse = await helper.app.request(`${BASE_PATH}/sign-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      });
      expect(signOutResponse.status).toBe(204);

      // 4. Sign in again
      const signInResponse = await helper.app.request(`${BASE_PATH}/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'flow@example.com',
          password: 'FlowPassword123!',
        }),
      });

      expect(signInResponse.status).toBe(200);
      const signInData = (await signInResponse.json()) as { token: string };
      expect(signInData.token).toBeDefined();

      // 5. Get JWT token
      const tokenResponse = await helper.app.request(`${BASE_PATH}/token`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${signInData.token}` },
      });

      expect(tokenResponse.status).toBe(200);
      const tokenData = (await tokenResponse.json()) as { token: string };
      expect(tokenData.token).toBeDefined();
    });
  });
});
