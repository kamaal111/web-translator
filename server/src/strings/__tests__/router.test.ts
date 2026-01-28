import { beforeAll, afterAll, describe, test, expect } from 'bun:test';
import TestHelper from '../../__tests__/test-helper';

const helper = new TestHelper();

describe('Strings API', () => {
  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  describe('GET /app-api/v1/s/:projectId - List Strings', () => {
    test('should return 404 when not authenticated', async () => {
      const response = await helper.app.request('/app-api/v1/s/test-project-id');
      expect(response.status).toBe(404);
    });

    test('should return empty array when project has no strings', async () => {
      await helper.signInAsDefaultUser();

      // Create a project first
      const projectResponse = await helper.createProject({
        name: 'Empty Strings Project',
        default_locale: 'en',
        enabled_locales: ['en', 'es'],
        public_read_key: 'pk_test_empty',
      });
      expect(projectResponse.status).toBe(201);
      const project = (await projectResponse.json()) as { id: string };

      // List strings for the project
      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      expect(response.status).toBe(200);

      const strings = await response.json();
      expect(Array.isArray(strings)).toBe(true);
      expect(strings).toHaveLength(0);
    });

    test('should return all strings for a project', async () => {
      await helper.signInAsDefaultUser();

      // Create a project
      const projectResponse = await helper.createProject({
        name: 'Test Strings Project',
        default_locale: 'en',
        enabled_locales: ['en', 'es', 'fr'],
        public_read_key: 'pk_test_strings',
      });
      const project = (await projectResponse.json()) as { id: string };

      // Create multiple strings with translations using upsert
      await helper.upsertTranslations(project.id, [
        { key: 'HOME.TITLE', context: 'Page title for home page', translations: { en: 'Home' } },
        { key: 'HOME.SUBTITLE', context: 'Subtitle below the main title', translations: { en: 'Subtitle' } },
        { key: 'COMMON.SUBMIT', translations: { en: 'Submit' } },
        { key: 'COMMON.CANCEL', context: 'Cancel button text', translations: { en: 'Cancel' } },
      ]);

      // List strings
      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      expect(response.status).toBe(200);

      const strings = (await response.json()) as Array<{
        id: string;
        key: string;
        context: string | null;
        project_id: string;
      }>;
      expect(Array.isArray(strings)).toBe(true);
      expect(strings).toHaveLength(4);

      // Verify structure
      for (const str of strings) {
        expect(str).toHaveProperty('id');
        expect(str).toHaveProperty('key');
        expect(str).toHaveProperty('context');
        expect(str).toHaveProperty('project_id');
        expect(str.project_id).toBe(project.id);
      }

      // Verify keys are returned
      const keys = strings.map(s => s.key);
      expect(keys).toContain('HOME.TITLE');
      expect(keys).toContain('HOME.SUBTITLE');
      expect(keys).toContain('COMMON.SUBMIT');
      expect(keys).toContain('COMMON.CANCEL');
    });

    test('should only return strings for the specified project', async () => {
      await helper.signInAsDefaultUser();

      // Create two projects
      const project1Response = await helper.createProject({
        name: 'Project 1',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_proj1',
      });
      const project1 = (await project1Response.json()) as { id: string };

      const project2Response = await helper.createProject({
        name: 'Project 2',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_proj2',
      });
      const project2 = (await project2Response.json()) as { id: string };

      // Create strings in both projects
      await helper.upsertTranslations(project1.id, [
        { key: 'PROJECT1.KEY', context: 'Only in project 1', translations: { en: 'P1 Value' } },
      ]);

      await helper.upsertTranslations(project2.id, [
        { key: 'PROJECT2.KEY', context: 'Only in project 2', translations: { en: 'P2 Value' } },
      ]);

      // List strings for project 1
      const headers = await helper.getDefaultUserHeaders();
      const response1 = await helper.app.request(`/app-api/v1/s/${project1.id}`, {
        method: 'GET',
        headers,
      });
      const strings1 = (await response1.json()) as Array<{ key: string }>;
      expect(strings1).toHaveLength(1);
      expect(strings1[0]?.key).toBe('PROJECT1.KEY');

      // List strings for project 2
      const response2 = await helper.app.request(`/app-api/v1/s/${project2.id}`, {
        method: 'GET',
        headers,
      });
      const strings2 = (await response2.json()) as Array<{ key: string }>;
      expect(strings2).toHaveLength(1);
      expect(strings2[0]?.key).toBe('PROJECT2.KEY');
    });
  });

  describe('PUT /app-api/v1/s/:projectId/translations - Upsert Translations', () => {
    test('should return 404 when not authenticated', async () => {
      const response = await helper.app.request('/app-api/v1/s/some-project-id/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: [] }),
      });
      expect(response.status).toBe(404);
    });

    test('should create new strings with translations', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Upsert Test Project',
        default_locale: 'en',
        enabled_locales: ['en', 'es'],
        public_read_key: 'pk_upsert_test',
      });
      const project = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(project.id, [
        {
          key: 'NEW.KEY1',
          context: 'First new key',
          translations: { en: 'English Value 1', es: 'Spanish Value 1' },
        },
        {
          key: 'NEW.KEY2',
          translations: { en: 'English Value 2' },
        },
      ]);

      expect(upsertResponse.status).toBe(200);
      const result = (await upsertResponse.json()) as { updated_count: number };
      expect(result.updated_count).toBe(3); // 2 en + 1 es

      // Verify strings were created
      const headers = await helper.getDefaultUserHeaders();
      const listResponse = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      const strings = (await listResponse.json()) as Array<{ key: string; context: string | null }>;
      expect(strings).toHaveLength(2);

      const key1 = strings.find(s => s.key === 'NEW.KEY1');
      expect(key1?.context).toBe('First new key');
    });

    test('should update existing strings and translations', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Update Test Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_update_test',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Create initial translation
      await helper.upsertTranslations(project.id, [
        { key: 'UPDATE.KEY', context: 'Original context', translations: { en: 'Original Value' } },
      ]);

      // Update the translation
      await helper.upsertTranslations(project.id, [
        { key: 'UPDATE.KEY', context: 'Updated context', translations: { en: 'Updated Value' } },
      ]);

      // Publish snapshot to make it accessible via public API
      await helper.publishSnapshot(project.id, 'en');

      // Verify translation was updated
      const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: { 'x-public-key': project.public_read_key },
      });
      const translations = (await response.json()) as Record<string, string>;
      expect(translations['UPDATE.KEY']).toBe('Updated Value');

      // Verify context was updated
      const headers = await helper.getDefaultUserHeaders();
      const listResponse = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      const strings = (await listResponse.json()) as Array<{ key: string; context: string | null }>;
      const updatedString = strings.find(s => s.key === 'UPDATE.KEY');
      expect(updatedString?.context).toBe('Updated context');
    });

    test('should handle multiple locales in a single request', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Multi-locale Test Project',
        default_locale: 'en',
        enabled_locales: ['en', 'es', 'fr', 'de'],
        public_read_key: 'pk_multi_locale',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      await helper.upsertTranslations(project.id, [
        {
          key: 'GREETING',
          translations: {
            en: 'Hello',
            es: 'Hola',
            fr: 'Bonjour',
            de: 'Hallo',
          },
        },
      ]);

      // Publish snapshots for all locales
      await helper.publishSnapshot(project.id, 'en');
      await helper.publishSnapshot(project.id, 'es');
      await helper.publishSnapshot(project.id, 'fr');
      await helper.publishSnapshot(project.id, 'de');

      // Verify all locales
      for (const [locale, expected] of [
        ['en', 'Hello'],
        ['es', 'Hola'],
        ['fr', 'Bonjour'],
        ['de', 'Hallo'],
      ]) {
        const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/${locale}`, {
          headers: { 'x-public-key': project.public_read_key },
        });
        const translations = (await response.json()) as Record<string, string>;
        expect(translations.GREETING).toBe(expected);
      }
    });

    test('should only update specified keys without affecting other strings (inArray test)', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'InArray Test Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_inarray_test',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      await helper.upsertTranslations(project.id, [
        { key: 'KEY1', translations: { en: 'Original Value 1' } },
        { key: 'KEY2', translations: { en: 'Original Value 2' } },
        { key: 'KEY3', translations: { en: 'Original Value 3' } },
      ]);

      const headers = await helper.getDefaultUserHeaders();
      const beforeResponse = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      const beforeStrings = (await beforeResponse.json()) as Array<{ key: string }>;
      expect(beforeStrings).toHaveLength(3);

      await helper.upsertTranslations(project.id, [{ key: 'KEY2', translations: { en: 'Updated Value 2' } }]);

      const afterResponse = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      const afterStrings = (await afterResponse.json()) as Array<{ key: string }>;
      expect(afterStrings).toHaveLength(3);

      await helper.publishSnapshot(project.id, 'en');
      const translationsResponse = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: { 'x-public-key': project.public_read_key },
      });
      const translations = (await translationsResponse.json()) as Record<string, string>;

      expect(translations.KEY1).toBe('Original Value 1');
      expect(translations.KEY2).toBe('Updated Value 2');
      expect(translations.KEY3).toBe('Original Value 3');

      const upsertResponse = await helper.upsertTranslations(project.id, [
        { key: 'KEY2', translations: { en: 'Updated Again' } },
      ]);
      const result = (await upsertResponse.json()) as { updated_count: number };
      expect(result.updated_count).toBe(1);
    });

    test('should handle mix of new and existing keys without duplicates', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Mixed Keys Test Project',
        default_locale: 'en',
        enabled_locales: ['en', 'es'],
        public_read_key: 'pk_mixed_keys',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      await helper.upsertTranslations(project.id, [
        { key: 'EXISTING.KEY1', translations: { en: 'Existing 1' } },
        { key: 'EXISTING.KEY2', translations: { en: 'Existing 2' } },
      ]);

      const headers = await helper.getDefaultUserHeaders();
      const beforeResponse = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      const beforeStrings = (await beforeResponse.json()) as Array<{ key: string }>;
      expect(beforeStrings).toHaveLength(2);

      await helper.upsertTranslations(project.id, [
        { key: 'EXISTING.KEY1', translations: { en: 'Updated 1', es: 'Actualizado 1' } },
        { key: 'NEW.KEY', translations: { en: 'New', es: 'Nuevo' } },
      ]);

      const afterResponse = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      const afterStrings = (await afterResponse.json()) as Array<{ key: string }>;
      expect(afterStrings).toHaveLength(3);

      await helper.publishSnapshot(project.id, 'en');
      await helper.publishSnapshot(project.id, 'es');

      const enResponse = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: { 'x-public-key': project.public_read_key },
      });
      const enTranslations = (await enResponse.json()) as Record<string, string>;
      expect(enTranslations['EXISTING.KEY1']).toBe('Updated 1');
      expect(enTranslations['EXISTING.KEY2']).toBe('Existing 2');
      expect(enTranslations['NEW.KEY']).toBe('New');

      const esResponse = await helper.app.request(`/api/v1/projects/${project.id}/translations/es`, {
        headers: { 'x-public-key': project.public_read_key },
      });
      const esTranslations = (await esResponse.json()) as Record<string, string>;
      expect(esTranslations['EXISTING.KEY1']).toBe('Actualizado 1');
      expect(esTranslations['NEW.KEY']).toBe('Nuevo');
      expect(esTranslations['EXISTING.KEY2']).toBeUndefined();
    });

    test('should correctly count translations in response', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Count Test Project',
        default_locale: 'en',
        enabled_locales: ['en', 'es', 'fr'],
        public_read_key: 'pk_count_test',
      });
      const project = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(project.id, [
        { key: 'KEY1', translations: { en: 'E1', es: 'S1', fr: 'F1' } },
        { key: 'KEY2', translations: { en: 'E2' } },
        { key: 'KEY3', translations: { es: 'S3', fr: 'F3' } },
      ]);

      expect(upsertResponse.status).toBe(200);
      const result = (await upsertResponse.json()) as { updated_count: number };
      expect(result.updated_count).toBe(6);
    });

    test('should reject empty translations array', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Empty Array Test Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_empty_array',
      });
      const project = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(project.id, []);
      expect(upsertResponse.status).toBe(400);
    });

    test('should efficiently batch update multiple string contexts', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Batch Update Test Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_batch_update',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      await helper.upsertTranslations(project.id, [
        { key: 'KEY1', context: 'Original Context 1', translations: { en: 'Value 1' } },
        { key: 'KEY2', context: 'Original Context 2', translations: { en: 'Value 2' } },
        { key: 'KEY3', context: 'Original Context 3', translations: { en: 'Value 3' } },
        { key: 'KEY4', context: 'Original Context 4', translations: { en: 'Value 4' } },
      ]);

      await helper.upsertTranslations(project.id, [
        { key: 'KEY1', context: 'Updated Context 1', translations: { en: 'Value 1' } },
        { key: 'KEY2', context: 'Updated Context 2', translations: { en: 'Value 2' } },
        { key: 'KEY3', context: 'Updated Context 3', translations: { en: 'Value 3' } },
        { key: 'KEY4', context: 'Updated Context 4', translations: { en: 'Value 4' } },
      ]);

      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      const strings = (await response.json()) as Array<{ key: string; context: string | null }>;

      expect(strings).toHaveLength(4);
      expect(strings.find(s => s.key === 'KEY1')?.context).toBe('Updated Context 1');
      expect(strings.find(s => s.key === 'KEY2')?.context).toBe('Updated Context 2');
      expect(strings.find(s => s.key === 'KEY3')?.context).toBe('Updated Context 3');
      expect(strings.find(s => s.key === 'KEY4')?.context).toBe('Updated Context 4');
    });

    test('should safely handle malicious input in context (SQL injection protection)', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'SQL Injection Test Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_sql_injection',
      });
      const project = (await projectResponse.json()) as { id: string };

      const maliciousContext = "'; DROP TABLE strings; --";

      await helper.upsertTranslations(project.id, [
        { key: 'MALICIOUS.KEY', context: maliciousContext, translations: { en: 'Test Value' } },
      ]);

      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`/app-api/v1/s/${project.id}`, {
        method: 'GET',
        headers,
      });
      const strings = (await response.json()) as Array<{ key: string; context: string | null }>;

      expect(strings).toHaveLength(1);
      expect(strings[0]?.context).toBe(maliciousContext);
    });
  });
});
