import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import path from 'node:path';

import { ErrorResponseSchema } from '@wt/schemas';

import { APP_API_BASE_PATH } from '../../constants/common';
import { ROUTE_NAME } from '../constants';
import TestHelper from '../../__tests__/test-helper';
import { AuthResponseSchema, SessionResponseSchema, JWKSResponseSchema } from '../schemas/responses';

const BASE_PATH = path.join(APP_API_BASE_PATH, ROUTE_NAME);

describe('Auth Router Integration Tests', () => {
  const helper = new TestHelper();

  beforeAll(helper.beforeAll);

  afterAll(helper.afterAll);

  describe('POST /sign-up/email', () => {
    test('should successfully register a new user', async () => {
      const response = await helper.signUpUser('newuser@example.com', 'Test User');

      expect(response.status).toBe(201);
      const data = AuthResponseSchema.parse(await response.json());
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe('string');

      const authHeader = response.headers.get('set-auth-token');
      expect(authHeader).toBeDefined();
    });

    test('should reject duplicate email', async () => {
      // First signup
      await helper.signUpUser('duplicate@example.com', 'First User');

      // Attempt duplicate signup
      const response = await helper.signUpUser('duplicate@example.com', 'Second User');

      expect(response.status).toBe(409);
      const data = ErrorResponseSchema.parse(await response.json());
      expect(data.message).toBeDefined();
    });

    test('should reject invalid email format', async () => {
      const response = await helper.signUpUser('invalid-email', 'Test User');

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
      const response = await helper.signUpUser('test3@example.com', '  Spaced Name  ');

      expect(response.status).toBe(201);
    });
  });

  describe('POST /sign-in/email', () => {
    const testUser = {
      email: 'signin@example.com',
      name: 'Sign In User',
    };

    beforeAll(async () => {
      // Create a test user
      await helper.signUpUser(testUser.email, testUser.name);
    });

    test('should successfully sign in existing user', async () => {
      const response = await helper.signInUser(testUser.email);

      expect(response.status).toBe(200);
      const data = AuthResponseSchema.parse(await response.json());
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
      const response = await helper.signInUser('nonexistent@example.com');

      expect(response.status).toBe(401);
    });

    test('should reject invalid email format', async () => {
      const response = await helper.signInUser('invalid-email');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /sign-out', () => {
    let sessionToken: string;

    beforeAll(async () => {
      // Create user and sign in to get a session token
      const signUpResponse = await helper.signUpUser('signout@example.com', 'Sign Out User');

      const data = AuthResponseSchema.parse(await signUpResponse.json());
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
    let cookies: string;

    beforeAll(async () => {
      // Create user and sign in to get a session token
      const signUpResponse = await helper.signUpUser('session@example.com', 'Session User');

      const data = AuthResponseSchema.parse(await signUpResponse.json());
      sessionToken = data.token;
      cookies = signUpResponse.headers.get('set-cookie') ?? '';
    });

    test('should retrieve current session with valid token', async () => {
      const response = await helper.app.request(`${BASE_PATH}/session`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          Cookie: cookies,
        },
      });

      expect(response.status).toBe(200);
      const data = SessionResponseSchema.parse(await response.json());
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
      const signUpResponse = await helper.signUpUser('token@example.com', 'Token User');

      const data = AuthResponseSchema.parse(await signUpResponse.json());
      sessionToken = data.token;
    });

    test('should retrieve JWT token with valid session', async () => {
      const response = await helper.app.request(`${BASE_PATH}/token`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      expect(response.status).toBe(200);
      const data = AuthResponseSchema.parse(await response.json());
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
      const data = JWKSResponseSchema.parse(await response.json());
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
      const signUpResponse = await helper.signUpUser('flow@example.com', 'Flow User');

      expect(signUpResponse.status).toBe(201);
      const signUpData = AuthResponseSchema.parse(await signUpResponse.json());
      const token1 = signUpData.token;
      const cookies1 = signUpResponse.headers.get('set-cookie') ?? '';

      // 2. Check session
      const sessionResponse = await helper.app.request(`${BASE_PATH}/session`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token1}`,
          Cookie: cookies1,
        },
      });

      expect(sessionResponse.status).toBe(200);
      const sessionData = SessionResponseSchema.parse(await sessionResponse.json());
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
      const signInResponse = await helper.signInUser('flow@example.com');

      expect(signInResponse.status).toBe(200);
      const signInData = AuthResponseSchema.parse(await signInResponse.json());
      expect(signInData.token).toBeDefined();

      // 5. Get JWT token
      const tokenResponse = await helper.app.request(`${BASE_PATH}/token`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${signInData.token}` },
      });

      expect(tokenResponse.status).toBe(200);
      const tokenData = AuthResponseSchema.parse(await tokenResponse.json());
      expect(tokenData.token).toBeDefined();
    });
  });
});
