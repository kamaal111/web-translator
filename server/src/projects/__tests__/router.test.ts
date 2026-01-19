import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import path from 'node:path';

import { APP_API_BASE_PATH } from '../../constants/common';
import { ROUTE_NAME } from '../constants';
import TestHelper from '../../__tests__/test-helper';
import type { CreateProjectResponse } from '../schemas';

const BASE_PATH = path.join(APP_API_BASE_PATH, ROUTE_NAME);

describe('Projects Router Integration Tests', () => {
  const helper = new TestHelper();

  beforeAll(helper.beforeAll);

  afterAll(helper.afterAll);

  async function getAuthHeaders() {
    const signInResponse = await helper.signInAsDefaultUser();
    const { token } = (await signInResponse.json()) as { token: string };
    const cookies = signInResponse.headers.get('set-cookie') ?? '';

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Cookie: cookies,
    };
  }

  describe('POST /', () => {
    test('should successfully create a new project with valid data', async () => {
      const headers = await getAuthHeaders();
      const projectData = {
        name: 'My Test App',
        default_locale: 'en-US',
        enabled_locales: ['en-US', 'fr-FR', 'es-ES'],
        public_read_key: 'pk_test123456',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as CreateProjectResponse;
      expect(data.id).toBeDefined();
      expect(typeof data.id).toBe('string');
      expect(data.name).toBe(projectData.name);
      expect(data.default_locale).toBe(projectData.default_locale);
      expect(data.enabled_locales).toEqual(projectData.enabled_locales);
      expect(data.public_read_key).toBe(projectData.public_read_key);
    });

    test('should automatically include default_locale in enabled_locales if missing', async () => {
      const headers = await getAuthHeaders();
      const projectData = {
        name: 'Test App Without Default',
        default_locale: 'en-US',
        enabled_locales: ['fr-FR', 'es-ES'],
        public_read_key: 'pk_test789',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as CreateProjectResponse;
      expect(data.enabled_locales).toContain('en-US');
      expect(data.enabled_locales[0]).toBe('en-US');
      expect(data.enabled_locales).toContain('fr-FR');
      expect(data.enabled_locales).toContain('es-ES');
    });

    test('should remove duplicate locales from enabled_locales', async () => {
      const headers = await getAuthHeaders();

      const projectData = {
        name: 'Test App With Duplicates',
        default_locale: 'en-US',
        enabled_locales: ['en-US', 'fr-FR', 'en-US', 'es-ES', 'fr-FR'],
        public_read_key: 'pk_test456',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as CreateProjectResponse;
      expect(data.enabled_locales.length).toBe(3);
      expect(new Set(data.enabled_locales).size).toBe(3);
      expect(data.enabled_locales).toContain('en-US');
      expect(data.enabled_locales).toContain('fr-FR');
      expect(data.enabled_locales).toContain('es-ES');
    });

    test('should reject request without authentication', async () => {
      const projectData = {
        name: 'Unauthenticated Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_unauth',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(404);
    });

    test('should reject request with empty name', async () => {
      const headers = await getAuthHeaders();
      const projectData = {
        name: '',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_test',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(400);
    });

    test('should reject request with whitespace-only name', async () => {
      const headers = await getAuthHeaders();
      const projectData = {
        name: '   ',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_test',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(400);
    });

    test('should reject request with empty public_read_key', async () => {
      const headers = await getAuthHeaders();
      const projectData = {
        name: 'Test App',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: '',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(400);
    });

    test('should reject request with missing required fields', async () => {
      const headers = await getAuthHeaders();
      const incompleteData = {
        name: 'Test App',
        default_locale: 'en-US',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(incompleteData),
      });

      expect(response.status).toBe(400);
    });

    test('should trim whitespace from name', async () => {
      const headers = await getAuthHeaders();
      const projectData = {
        name: '  Whitespace App  ',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_whitespace',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as CreateProjectResponse;
      expect(data.name).toBe('Whitespace App');
    });

    test('should associate project with authenticated user', async () => {
      const customUserEmail = 'projectowner@example.com';
      await helper.signUpUser(customUserEmail, 'Project Owner');

      const signInResponse = await helper.signInUser(customUserEmail);
      const { token } = (await signInResponse.json()) as { token: string };
      const cookies = signInResponse.headers.get('set-cookie') ?? '';

      const projectData = {
        name: 'User Specific Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_usertest',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Cookie: cookies,
        },
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as CreateProjectResponse;
      expect(data.id).toBeDefined();
      expect(data.name).toBe(projectData.name);
    });

    test('should handle empty enabled_locales array', async () => {
      const headers = await getAuthHeaders();
      const projectData = {
        name: 'Empty Locales App',
        default_locale: 'en-US',
        enabled_locales: [],
        public_read_key: 'pk_empty',
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as CreateProjectResponse;
      expect(data.enabled_locales).toContain('en-US');
      expect(data.enabled_locales.length).toBe(1);
    });
  });
});
