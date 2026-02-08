import { beforeAll, beforeEach, afterAll, describe, test, expect } from 'bun:test';
import assert from 'node:assert';

import TestHelper from '../../__tests__/test-helper';
import { ProjectResponseSchema } from '../../projects/schemas';
import { ListStringsResponseSchema, UpsertTranslationsResponseSchema, GetTranslationsResponseSchema } from '../schemas';

const helper = new TestHelper();

describe('Strings API', () => {
  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  const setupProject = async (locales: string[] = ['en', 'es', 'fr']) => {
    const projectResponse = await helper.createProject({
      name: `Test Project ${Date.now()}`,
      default_locale: 'en',
      enabled_locales: locales,
      public_read_key: `pk_${Date.now()}`,
    });
    return ProjectResponseSchema.parse(await projectResponse.json());
  };

  const fetchStrings = async (projectId: string) => {
    const headers = await helper.getDefaultUserHeaders();
    const response = await helper.app.request(`/app-api/v1/s/${projectId}`, { method: 'GET', headers });
    expect(response.status).toBe(200);
    return ListStringsResponseSchema.parse(await response.json());
  };

  const findString = <T extends { key: string }>(strings: T[], key: string): T => {
    const string = strings.find(s => s.key === key);
    assert(string, `Expected to find string with key: ${key}`);
    return string;
  };

  const publishAndFetch = async (projectId: string, locale: string, publicKey: string) => {
    await helper.publishSnapshot(projectId, locale);
    const response = await helper.app.request(`/api/v1/projects/${projectId}/translations/${locale}`, {
      headers: { 'x-public-key': publicKey },
    });
    return GetTranslationsResponseSchema.parse(await response.json());
  };

  describe('GET /app-api/v1/s/:projectId - List Strings', () => {
    beforeEach(async () => {
      await helper.signInAsDefaultUser();
    });

    test('should return 404 when not authenticated', async () => {
      const response = await helper.app.request('/app-api/v1/s/test-project-id');
      expect(response.status).toBe(404);
    });

    test('should return empty array when project has no strings', async () => {
      const project = await setupProject();
      const strings = await fetchStrings(project.id);
      expect(strings).toHaveLength(0);
    });

    test('should return all strings for a project', async () => {
      const project = await setupProject();

      await helper.upsertTranslations(project.id, [
        { key: 'HOME.TITLE', context: 'Page title for home page', translations: { en: 'Home' } },
        { key: 'HOME.SUBTITLE', context: 'Subtitle below the main title', translations: { en: 'Subtitle' } },
        { key: 'COMMON.SUBMIT', translations: { en: 'Submit' } },
        { key: 'COMMON.CANCEL', context: 'Cancel button text', translations: { en: 'Cancel' } },
      ]);

      const strings = await fetchStrings(project.id);
      expect(strings).toHaveLength(4);

      for (const str of strings) {
        expect(str.project_id).toBe(project.id);
      }

      const keys = strings.map(s => s.key);
      expect(keys).toContain('HOME.TITLE');
      expect(keys).toContain('HOME.SUBTITLE');
      expect(keys).toContain('COMMON.SUBMIT');
      expect(keys).toContain('COMMON.CANCEL');
    });

    test('should only return strings for the specified project', async () => {
      const project1 = await setupProject();
      const project2 = await setupProject();

      await helper.upsertTranslations(project1.id, [{ key: 'PROJECT1.KEY', translations: { en: 'P1 Value' } }]);
      await helper.upsertTranslations(project2.id, [{ key: 'PROJECT2.KEY', translations: { en: 'P2 Value' } }]);

      const strings1 = await fetchStrings(project1.id);
      expect(strings1).toHaveLength(1);
      expect(strings1[0]?.key).toBe('PROJECT1.KEY');

      const strings2 = await fetchStrings(project2.id);
      expect(strings2).toHaveLength(1);
      expect(strings2[0]?.key).toBe('PROJECT2.KEY');
    });

    test.each([
      {
        scenario: 'single locale',
        input: [{ key: 'TEST.KEY', translations: { en: 'Value' } }],
        assertions: { 'TEST.KEY': { en: 'Value' } },
      },
      {
        scenario: 'multiple locales',
        input: [{ key: 'HOME.TITLE', translations: { en: 'Home', es: 'Inicio', fr: 'Accueil' } }],
        assertions: { 'HOME.TITLE': { en: 'Home', es: 'Inicio', fr: 'Accueil' } },
      },
      {
        scenario: 'partial locale coverage',
        input: [
          { key: 'GREETING', translations: { en: 'Hello', es: 'Hola' } },
          { key: 'FAREWELL', translations: { en: 'Goodbye' } },
        ],
        assertions: {
          GREETING: { en: 'Hello', es: 'Hola' },
          FAREWELL: { en: 'Goodbye' },
        },
      },
    ])('should include translations with $scenario', async ({ input, assertions }) => {
      const project = await setupProject();
      await helper.upsertTranslations(project.id, [...input]);
      const strings = await fetchStrings(project.id);

      for (const [key, expected] of Object.entries(assertions)) {
        expect(findString(strings, key).translations).toEqual(expected);
      }
    });

    test('should merge translations from incremental updates', async () => {
      const project = await setupProject();

      await helper.upsertTranslations(project.id, [{ key: 'KEY1', translations: { en: 'English' } }]);
      await helper.upsertTranslations(project.id, [{ key: 'KEY1', translations: { es: 'Spanish', fr: 'French' } }]);

      const strings = await fetchStrings(project.id);
      expect(findString(strings, 'KEY1').translations).toEqual({
        en: 'English',
        es: 'Spanish',
        fr: 'French',
      });
    });

    test('should reflect updated translation values', async () => {
      const project = await setupProject(['en', 'es']);

      await helper.upsertTranslations(project.id, [{ key: 'GREETING', translations: { en: 'Hello', es: 'Hola' } }]);
      const initialStrings = await fetchStrings(project.id);
      expect(findString(initialStrings, 'GREETING').translations).toEqual({ en: 'Hello', es: 'Hola' });

      await helper.upsertTranslations(project.id, [{ key: 'GREETING', translations: { en: 'Hi', es: 'Ola' } }]);
      const updatedStrings = await fetchStrings(project.id);
      expect(findString(updatedStrings, 'GREETING').translations).toEqual({ en: 'Hi', es: 'Ola' });
    });
  });

  describe('PUT /app-api/v1/s/:projectId/translations - Upsert Translations', () => {
    beforeEach(async () => {
      await helper.signInAsDefaultUser();
    });

    test('should return 404 when not authenticated', async () => {
      const response = await helper.app.request('/app-api/v1/s/some-project-id/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: [] }),
      });
      expect(response.status).toBe(404);
    });

    test('should create new strings with translations', async () => {
      const project = await setupProject(['en', 'es']);

      const upsertResponse = await helper.upsertTranslations(project.id, [
        { key: 'NEW.KEY1', context: 'First new key', translations: { en: 'English Value 1', es: 'Spanish Value 1' } },
        { key: 'NEW.KEY2', translations: { en: 'English Value 2' } },
      ]);

      expect(upsertResponse.status).toBe(200);
      const result = UpsertTranslationsResponseSchema.parse(await upsertResponse.json());
      expect(result.updated_count).toBe(3);

      const strings = await fetchStrings(project.id);
      expect(strings).toHaveLength(2);
      expect(findString(strings, 'NEW.KEY1').context).toBe('First new key');
    });

    test('should update existing strings and translations', async () => {
      const project = await setupProject(['en']);

      await helper.upsertTranslations(project.id, [
        { key: 'UPDATE.KEY', context: 'Original context', translations: { en: 'Original Value' } },
      ]);

      await helper.upsertTranslations(project.id, [
        { key: 'UPDATE.KEY', context: 'Updated context', translations: { en: 'Updated Value' } },
      ]);

      const translations = await publishAndFetch(project.id, 'en', project.public_read_key);
      expect(translations['UPDATE.KEY']).toBe('Updated Value');

      const strings = await fetchStrings(project.id);
      expect(findString(strings, 'UPDATE.KEY').context).toBe('Updated context');
    });

    test('should handle multiple locales in a single request', async () => {
      const project = await setupProject(['en', 'es', 'fr', 'de']);

      await helper.upsertTranslations(project.id, [
        { key: 'GREETING', translations: { en: 'Hello', es: 'Hola', fr: 'Bonjour', de: 'Hallo' } },
      ]);

      for (const [locale, expected] of [
        ['en', 'Hello'],
        ['es', 'Hola'],
        ['fr', 'Bonjour'],
        ['de', 'Hallo'],
      ] as const) {
        const translations = await publishAndFetch(project.id, locale, project.public_read_key);
        expect(translations.GREETING).toBe(expected);
      }
    });

    test('should only update specified keys without affecting others', async () => {
      const project = await setupProject(['en']);

      await helper.upsertTranslations(project.id, [
        { key: 'KEY1', translations: { en: 'Original Value 1' } },
        { key: 'KEY2', translations: { en: 'Original Value 2' } },
        { key: 'KEY3', translations: { en: 'Original Value 3' } },
      ]);

      await helper.upsertTranslations(project.id, [{ key: 'KEY2', translations: { en: 'Updated Value 2' } }]);

      const translations = await publishAndFetch(project.id, 'en', project.public_read_key);
      expect(translations.KEY1).toBe('Original Value 1');
      expect(translations.KEY2).toBe('Updated Value 2');
      expect(translations.KEY3).toBe('Original Value 3');

      const upsertResponse = await helper.upsertTranslations(project.id, [
        { key: 'KEY2', translations: { en: 'Updated Again' } },
      ]);
      const result = UpsertTranslationsResponseSchema.parse(await upsertResponse.json());
      expect(result.updated_count).toBe(1);
    });

    test('should handle mix of new and existing keys', async () => {
      const project = await setupProject(['en', 'es']);

      await helper.upsertTranslations(project.id, [
        { key: 'EXISTING.KEY1', translations: { en: 'Existing 1' } },
        { key: 'EXISTING.KEY2', translations: { en: 'Existing 2' } },
      ]);

      await helper.upsertTranslations(project.id, [
        { key: 'EXISTING.KEY1', translations: { en: 'Updated 1', es: 'Actualizado 1' } },
        { key: 'NEW.KEY', translations: { en: 'New', es: 'Nuevo' } },
      ]);

      const strings = await fetchStrings(project.id);
      expect(strings).toHaveLength(3);

      const enTranslations = await publishAndFetch(project.id, 'en', project.public_read_key);
      expect(enTranslations['EXISTING.KEY1']).toBe('Updated 1');
      expect(enTranslations['EXISTING.KEY2']).toBe('Existing 2');
      expect(enTranslations['NEW.KEY']).toBe('New');

      const esTranslations = await publishAndFetch(project.id, 'es', project.public_read_key);
      expect(esTranslations['EXISTING.KEY1']).toBe('Actualizado 1');
      expect(esTranslations['NEW.KEY']).toBe('Nuevo');
      expect(esTranslations['EXISTING.KEY2']).toBeUndefined();
    });

    test('should correctly count translations in response', async () => {
      const project = await setupProject(['en', 'es', 'fr']);

      const upsertResponse = await helper.upsertTranslations(project.id, [
        { key: 'KEY1', translations: { en: 'E1', es: 'S1', fr: 'F1' } },
        { key: 'KEY2', translations: { en: 'E2' } },
        { key: 'KEY3', translations: { es: 'S3', fr: 'F3' } },
      ]);

      expect(upsertResponse.status).toBe(200);
      const result = UpsertTranslationsResponseSchema.parse(await upsertResponse.json());
      expect(result.updated_count).toBe(6);
    });

    test('should reject empty translations array', async () => {
      const project = await setupProject();
      const upsertResponse = await helper.upsertTranslations(project.id, []);
      expect(upsertResponse.status).toBe(400);
    });

    test('should batch update multiple string contexts', async () => {
      const project = await setupProject(['en']);

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

      const strings = await fetchStrings(project.id);
      expect(strings).toHaveLength(4);
      expect(findString(strings, 'KEY1').context).toBe('Updated Context 1');
      expect(findString(strings, 'KEY2').context).toBe('Updated Context 2');
      expect(findString(strings, 'KEY3').context).toBe('Updated Context 3');
      expect(findString(strings, 'KEY4').context).toBe('Updated Context 4');
    });

    test('should safely handle malicious input in context', async () => {
      const project = await setupProject(['en']);
      const maliciousContext = "'; DROP TABLE strings; --";

      await helper.upsertTranslations(project.id, [
        { key: 'MALICIOUS.KEY', context: maliciousContext, translations: { en: 'Test Value' } },
      ]);

      const strings = await fetchStrings(project.id);
      expect(strings).toHaveLength(1);
      expect(strings[0]?.context).toBe(maliciousContext);
    });
  });
});
