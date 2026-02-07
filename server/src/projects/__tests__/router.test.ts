import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import path from 'node:path';

import { ErrorResponseSchema } from '@wt/schemas';

import { APP_API_BASE_PATH } from '../../constants/common';
import { ROUTE_NAME } from '../constants';
import TestHelper from '../../__tests__/test-helper';
import { ProjectResponseSchema, ListProjectsResponseSchema } from '../schemas';
import { AuthResponseSchema } from '../../auth/schemas/responses';

const BASE_PATH = path.join(APP_API_BASE_PATH, ROUTE_NAME);

describe('Projects Router Integration Tests', () => {
  const helper = new TestHelper();

  beforeAll(helper.beforeAll);

  afterAll(helper.afterAll);

  describe('POST /', () => {
    test('should successfully create a new project with valid data', async () => {
      const headers = await helper.getDefaultUserHeaders();
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
      const data = ProjectResponseSchema.parse(await response.json());
      expect(data.id).toBeDefined();
      expect(typeof data.id).toBe('string');
      expect(data.name).toBe(projectData.name);
      expect(data.default_locale).toBe(projectData.default_locale);
      expect(data.enabled_locales).toEqual(projectData.enabled_locales);
      expect(data.public_read_key).toBe(projectData.public_read_key);
    });

    test('should automatically include default_locale in enabled_locales if missing', async () => {
      const headers = await helper.getDefaultUserHeaders();
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
      const data = ProjectResponseSchema.parse(await response.json());
      expect(data.enabled_locales).toContain('en-US');
      expect(data.enabled_locales[0]).toBe('en-US');
      expect(data.enabled_locales).toContain('fr-FR');
      expect(data.enabled_locales).toContain('es-ES');
    });

    test('should remove duplicate locales from enabled_locales', async () => {
      const headers = await helper.getDefaultUserHeaders();

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
      const data = ProjectResponseSchema.parse(await response.json());
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
      const headers = await helper.getDefaultUserHeaders();
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
      const headers = await helper.getDefaultUserHeaders();
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
      const headers = await helper.getDefaultUserHeaders();
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
      const headers = await helper.getDefaultUserHeaders();
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
      const headers = await helper.getDefaultUserHeaders();
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
      const data = ProjectResponseSchema.parse(await response.json());
      expect(data.name).toBe('Whitespace App');
    });

    test('should associate project with authenticated user', async () => {
      const customUserEmail = 'projectowner@example.com';
      await helper.signUpUser(customUserEmail, 'Project Owner');

      const signInResponse = await helper.signInUser(customUserEmail);
      const { token } = AuthResponseSchema.parse(await signInResponse.json());
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
      const data = ProjectResponseSchema.parse(await response.json());
      expect(data.id).toBeDefined();
      expect(data.name).toBe(projectData.name);
    });

    test('should handle empty enabled_locales array', async () => {
      const headers = await helper.getDefaultUserHeaders();
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
      const data = ProjectResponseSchema.parse(await response.json());
      expect(data.enabled_locales).toContain('en-US');
      expect(data.enabled_locales.length).toBe(1);
    });

    test('should reject duplicate project names for the same user', async () => {
      const headers = await helper.getDefaultUserHeaders();
      const projectData = {
        name: 'Unique Name Test Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_unique1',
      };

      const firstResponse = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(firstResponse.status).toBe(201);

      const duplicateData = {
        ...projectData,
        public_read_key: 'pk_unique2',
      };

      const secondResponse = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(duplicateData),
      });

      expect(secondResponse.status).toBe(409);
      const errorData = ErrorResponseSchema.parse(await secondResponse.json());
      expect(errorData.code).toBe('PROJECT_NAME_ALREADY_EXISTS');
      expect(errorData.message).toBe('A project with this name already exists');
    });

    test('should allow duplicate project names for different users', async () => {
      const headers = await helper.getDefaultUserHeaders();
      const projectData = {
        name: 'Shared Name Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_user1',
      };

      const firstResponse = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(firstResponse.status).toBe(201);

      const secondUserEmail = 'seconduser@example.com';
      await helper.signUpUser(secondUserEmail, 'Second User');

      const signInResponse = await helper.signInUser(secondUserEmail);
      const { token } = AuthResponseSchema.parse(await signInResponse.json());
      const cookies = signInResponse.headers.get('set-cookie') ?? '';

      const secondUserHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: cookies,
      };

      const secondProjectData = {
        ...projectData,
        public_read_key: 'pk_user2',
      };

      const secondResponse = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers: secondUserHeaders,
        body: JSON.stringify(secondProjectData),
      });

      expect(secondResponse.status).toBe(201);
      const data = ProjectResponseSchema.parse(await secondResponse.json());
      expect(data.name).toBe(projectData.name);
    });
  });

  describe('GET /', () => {
    test('should return empty array when user has no projects', async () => {
      const newUserEmail = 'noproject@example.com';
      await helper.signUpUser(newUserEmail, 'No Project User');

      const signInResponse = await helper.signInUser(newUserEmail);
      const { token } = AuthResponseSchema.parse(await signInResponse.json());
      const cookies = signInResponse.headers.get('set-cookie') ?? '';

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: cookies,
      };

      const response = await helper.app.request(BASE_PATH, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = ListProjectsResponseSchema.parse(await response.json());
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    test('should return all projects for authenticated user', async () => {
      const headers = await helper.getDefaultUserHeaders();

      const project1 = {
        name: 'List Test Project 1',
        default_locale: 'en-US',
        enabled_locales: ['en-US', 'fr-FR'],
        public_read_key: 'pk_list1',
      };

      const project2 = {
        name: 'List Test Project 2',
        default_locale: 'es-ES',
        enabled_locales: ['es-ES', 'de-DE'],
        public_read_key: 'pk_list2',
      };

      await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(project1),
      });

      await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(project2),
      });

      const response = await helper.app.request(BASE_PATH, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = ListProjectsResponseSchema.parse(await response.json());
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(2);

      const project1Data = data.find(p => p.name === project1.name);
      const project2Data = data.find(p => p.name === project2.name);

      expect(project1Data).toBeDefined();
      expect(project2Data).toBeDefined();
      expect(project1Data?.default_locale).toBe(project1.default_locale);
      expect(project2Data?.default_locale).toBe(project2.default_locale);
    });

    test('should only return projects belonging to authenticated user', async () => {
      const user1Headers = await helper.getDefaultUserHeaders();

      const user2Email = 'isolation_test_user@example.com';
      await helper.signUpUser(user2Email, 'Isolation Test User');

      const user2SignInResponse = await helper.signInUser(user2Email);
      const { token: user2Token } = AuthResponseSchema.parse(await user2SignInResponse.json());
      const user2Cookies = user2SignInResponse.headers.get('set-cookie') ?? '';
      const user2Headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user2Token}`,
        Cookie: user2Cookies,
      };

      const user1Project = {
        name: 'User 1 Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_user1_list',
      };

      const user2Project = {
        name: 'User 2 Project',
        default_locale: 'fr-FR',
        enabled_locales: ['fr-FR'],
        public_read_key: 'pk_user2_list',
      };

      const createUser1Response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers: user1Headers,
        body: JSON.stringify(user1Project),
      });
      expect(createUser1Response.status).toBe(201);

      const createUser2Response = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers: user2Headers,
        body: JSON.stringify(user2Project),
      });
      expect(createUser2Response.status).toBe(201);

      const user1Response = await helper.app.request(BASE_PATH, {
        method: 'GET',
        headers: user1Headers,
      });

      const user2Response = await helper.app.request(BASE_PATH, {
        method: 'GET',
        headers: user2Headers,
      });

      expect(user1Response.status).toBe(200);
      expect(user2Response.status).toBe(200);

      const user1Data = ListProjectsResponseSchema.parse(await user1Response.json());
      const user2Data = ListProjectsResponseSchema.parse(await user2Response.json());

      const user1HasUser2Project = user1Data.some(p => p.name === user2Project.name);
      const user2HasUser1Project = user2Data.some(p => p.name === user1Project.name);

      expect(user1HasUser2Project).toBe(false);
      expect(user2HasUser1Project).toBe(false);

      expect(user1Data.some(p => p.name === user1Project.name)).toBe(true);
      expect(user2Data.some(p => p.name === user2Project.name)).toBe(true);
    });

    test('should reject request without authentication', async () => {
      const response = await helper.app.request(BASE_PATH, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /:id', () => {
    test('should return project details for valid project ID', async () => {
      const headers = await helper.getDefaultUserHeaders();

      const projectData = {
        name: 'Read Test Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US', 'fr-FR'],
        public_read_key: 'pk_read_test',
      };

      const createResponse = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
      });

      expect(createResponse.status).toBe(201);
      const createdProject = ProjectResponseSchema.parse(await createResponse.json());

      const response = await helper.app.request(`${BASE_PATH}/${createdProject.id}`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = ProjectResponseSchema.parse(await response.json());
      expect(data.id).toBe(createdProject.id);
      expect(data.name).toBe(projectData.name);
      expect(data.default_locale).toBe(projectData.default_locale);
      expect(data.enabled_locales).toEqual(projectData.enabled_locales);
      expect(data.public_read_key).toBe(projectData.public_read_key);
    });

    test('should return 400 for invalid project ID format', async () => {
      const headers = await helper.getDefaultUserHeaders();

      const response = await helper.app.request(`${BASE_PATH}/invalid-id-format`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(400);
    });

    test('should return 404 for non-existent project ID with valid UUID format', async () => {
      const headers = await helper.getDefaultUserHeaders();
      const nonExistentUuid = '018d8f28-1234-7890-abcd-ef1234567890';

      const response = await helper.app.request(`${BASE_PATH}/${nonExistentUuid}`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(404);
      const data = ErrorResponseSchema.parse(await response.json());
      expect(data.code).toBe('NOT_FOUND');
      expect(data.message).toBe('Project not found');
    });

    test('should return 404 when accessing another users project', async () => {
      const user1Headers = await helper.getDefaultUserHeaders();

      const projectData = {
        name: 'User 1 Private Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_user1_private',
      };

      const createResponse = await helper.app.request(BASE_PATH, {
        method: 'POST',
        headers: user1Headers,
        body: JSON.stringify(projectData),
      });

      expect(createResponse.status).toBe(201);
      const createdProject = ProjectResponseSchema.parse(await createResponse.json());

      const user2Email = 'anotheruser@example.com';
      await helper.signUpUser(user2Email, 'Another User');

      const user2SignInResponse = await helper.signInUser(user2Email);
      const { token: user2Token } = AuthResponseSchema.parse(await user2SignInResponse.json());
      const user2Cookies = user2SignInResponse.headers.get('set-cookie') ?? '';
      const user2Headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user2Token}`,
        Cookie: user2Cookies,
      };

      const response = await helper.app.request(`${BASE_PATH}/${createdProject.id}`, {
        method: 'GET',
        headers: user2Headers,
      });

      expect(response.status).toBe(404);
      const data = ErrorResponseSchema.parse(await response.json());
      expect(data.code).toBe('NOT_FOUND');
    });

    test('should reject request without authentication', async () => {
      const response = await helper.app.request(`${BASE_PATH}/proj_test123`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(404);
    });
  });
});
