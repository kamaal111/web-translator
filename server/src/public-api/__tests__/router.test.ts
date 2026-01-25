import { beforeAll, afterAll, describe, test, expect } from 'bun:test';
import TestHelper from '../../__tests__/test-helper';

const helper = new TestHelper();

describe('Public API - Get Translations', () => {
  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  describe('GET /api/v1/projects/:projectId/translations/:locale', () => {
    test('should return 400 when public key header is missing', async () => {
      const response = await helper.app.request('/api/v1/projects/some-project-id/translations/en');
      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid project ID format', async () => {
      const response = await helper.app.request('/api/v1/projects/invalid-id/translations/en', {
        headers: {
          'x-public-key': 'some-key',
        },
      });
      expect(response.status).toBe(400);
    });

    test('should return 404 for valid UUID but non-existent project', async () => {
      const validUuid = '00000000-0000-0000-0000-000000000000';
      const response = await helper.app.request(`/api/v1/projects/${validUuid}/translations/en`, {
        headers: {
          'x-public-key': 'some-key',
        },
      });
      expect(response.status).toBe(404);
    });

    test('should return 401 when public key does not match', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Test Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_correct',
      });
      const project = (await projectResponse.json()) as { id: string };

      const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: {
          'x-public-key': 'pk_wrong',
        },
      });
      expect(response.status).toBe(401);
      const body = (await response.json()) as { message: string };
      expect(body.message).toContain('Invalid public key');
    });

    test('should return 404 when no versions are published', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Empty Translations Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_empty_trans',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(response.status).toBe(404);

      const body = (await response.json()) as { message: string };
      expect(body.message).toContain('No published versions');
    });

    test('should return empty object when snapshot has no translations', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Empty Snapshot Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_empty_snap',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Publish an empty snapshot (no translations yet)
      await helper.publishSnapshot(project.id, 'en');

      const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(response.status).toBe(200);

      const translations = await response.json();
      expect(translations).toEqual({});
    });

    test('should return latest published translations for a specific locale', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Translations Test Project',
        default_locale: 'en',
        enabled_locales: ['en', 'es', 'fr'],
        public_read_key: 'pk_trans_test',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Create strings with translations in batch
      await helper.upsertTranslations(project.id, [
        {
          key: 'HOME.TITLE',
          context: 'Page title',
          translations: { en: 'Welcome Home', es: 'Bienvenido a Casa' },
        },
        {
          key: 'HOME.SUBTITLE',
          context: 'Subtitle',
          translations: { en: 'Your dashboard' },
        },
      ]);

      // Publish snapshots for both locales
      await helper.publishSnapshot(project.id, 'en');
      await helper.publishSnapshot(project.id, 'es');

      // Get English translations without authentication
      const enResponse = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(enResponse.status).toBe(200);

      const enTranslations = (await enResponse.json()) as Record<string, string>;
      expect(enTranslations).toEqual({
        'HOME.TITLE': 'Welcome Home',
        'HOME.SUBTITLE': 'Your dashboard',
      });

      // Get Spanish translations (only one string translated)
      const esResponse = await helper.app.request(`/api/v1/projects/${project.id}/translations/es`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(esResponse.status).toBe(200);

      const esTranslations = (await esResponse.json()) as Record<string, string>;
      expect(esTranslations).toEqual({
        'HOME.TITLE': 'Bienvenido a Casa',
      });
    });

    test('should only return translated strings in snapshot, not untranslated ones', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Partial Translations Project',
        default_locale: 'en',
        enabled_locales: ['en', 'fr'],
        public_read_key: 'pk_partial',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Create 3 strings but only translate 2 of them
      await helper.upsertTranslations(project.id, [
        { key: 'KEY1', translations: { en: 'Value 1' } },
        { key: 'KEY2', translations: { en: 'Value 2' } },
        { key: 'KEY3', translations: {} }, // No translations
      ]);

      // Publish snapshot
      await helper.publishSnapshot(project.id, 'en');

      const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      const translations = (await response.json()) as Record<string, string>;

      expect(Object.keys(translations)).toHaveLength(2);
      expect(translations.KEY1).toBe('Value 1');
      expect(translations.KEY2).toBe('Value 2');
      expect(translations.KEY3).toBeUndefined();
    });

    test(
      'should handle large number of translations efficiently',
      async () => {
        await helper.signInAsDefaultUser();

        const projectResponse = await helper.createProject({
          name: 'Large Translations Project',
          default_locale: 'en',
          enabled_locales: ['en'],
          public_read_key: 'pk_large_trans',
        });
        const project = (await projectResponse.json()) as { id: string; public_read_key: string };
        const translationsCount = 10_000;

        // Create all translations in a single batch request
        const translationEntries = Array.from({ length: translationsCount }, (_, i) => ({
          key: `KEY.${i}`,
          translations: { en: `Value ${i}` },
        }));

        await helper.upsertTranslations(project.id, translationEntries);

        // Publish snapshot
        await helper.publishSnapshot(project.id, 'en');

        // Measure performance (now using JSONB snapshot - should be fast)
        const startTime = performance.now();
        const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
          headers: {
            'x-public-key': project.public_read_key,
          },
        });
        const endTime = performance.now();

        expect(response.status).toBe(200);

        const translations = (await response.json()) as Record<string, string>;
        expect(Object.keys(translations)).toHaveLength(translationsCount);

        // Should complete in reasonable time (under 50ms with JSONB)
        const elapsedTime = endTime - startTime;
        expect(elapsedTime).toBeLessThan(50);

        console.log(`✨ Fetched ${translationsCount} translations in ${elapsedTime.toFixed(2)}ms`);
      },
      { timeout: 15000 },
    );
  });

  describe('Versioned Translations', () => {
    test('should return 404 for non-existent version', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Version 404 Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_ver_404',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=999`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(response.status).toBe(404);

      const body = (await response.json()) as { message: string };
      expect(body.message).toContain('Version 999 not found');
    });

    test('should return 400 for invalid version number', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Invalid Version Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_invalid_ver',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Test non-numeric version
      const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=abc`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(response.status).toBe(400);

      // Test negative version
      const negativeResponse = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=-1`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(negativeResponse.status).toBe(400);

      // Test zero version
      const zeroResponse = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=0`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(zeroResponse.status).toBe(400);
    });

    test('should publish a snapshot and retrieve it by version', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Version Test Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_version_test',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Create initial translations
      await helper.upsertTranslations(project.id, [
        { key: 'GREETING', translations: { en: 'Hello v1' } },
        { key: 'FAREWELL', translations: { en: 'Goodbye v1' } },
      ]);

      // Publish version 1
      const publishResponse = await helper.publishSnapshot(project.id, 'en');
      expect(publishResponse.status).toBe(201);

      const publishBody = (await publishResponse.json()) as {
        version: number;
        translation_count: number;
        created_at: string;
      };
      expect(publishBody.version).toBe(1);
      expect(publishBody.translation_count).toBe(2);
      expect(publishBody.created_at).toBeDefined();

      // Retrieve version 1
      const v1Response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=1`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      expect(v1Response.status).toBe(200);

      const v1Translations = (await v1Response.json()) as Record<string, string>;
      expect(v1Translations).toEqual({
        GREETING: 'Hello v1',
        FAREWELL: 'Goodbye v1',
      });
    });

    test('should maintain snapshot immutability after translations change', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Immutable Snapshot Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_immutable',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Create initial translations
      await helper.upsertTranslations(project.id, [{ key: 'MESSAGE', translations: { en: 'Original' } }]);

      // Publish version 1
      await helper.publishSnapshot(project.id, 'en');

      // Update translations and publish version 2
      await helper.upsertTranslations(project.id, [{ key: 'MESSAGE', translations: { en: 'Updated' } }]);
      await helper.publishSnapshot(project.id, 'en');

      // Version 1 should still return original value (immutable)
      const v1Response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=1`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      const v1Translations = (await v1Response.json()) as Record<string, string>;
      expect(v1Translations.MESSAGE).toBe('Original');

      // Latest (no version param) should return version 2 with updated value
      const latestResponse = await helper.app.request(`/api/v1/projects/${project.id}/translations/en`, {
        headers: {
          'x-public-key': project.public_read_key,
        },
      });
      const latestTranslations = (await latestResponse.json()) as Record<string, string>;
      expect(latestTranslations.MESSAGE).toBe('Updated');
    });

    test('should support multiple versions with incremental version numbers', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Multi Version Project',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_multi_ver',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Create and publish version 1
      await helper.upsertTranslations(project.id, [{ key: 'KEY', translations: { en: 'v1' } }]);
      const pub1 = await helper.publishSnapshot(project.id, 'en');
      const pub1Body = (await pub1.json()) as { version: number };
      expect(pub1Body.version).toBe(1);

      // Create and publish version 2
      await helper.upsertTranslations(project.id, [{ key: 'KEY', translations: { en: 'v2' } }]);
      const pub2 = await helper.publishSnapshot(project.id, 'en');
      const pub2Body = (await pub2.json()) as { version: number };
      expect(pub2Body.version).toBe(2);

      // Create and publish version 3
      await helper.upsertTranslations(project.id, [{ key: 'KEY', translations: { en: 'v3' } }]);
      const pub3 = await helper.publishSnapshot(project.id, 'en');
      const pub3Body = (await pub3.json()) as { version: number };
      expect(pub3Body.version).toBe(3);

      // Verify each version returns correct data
      for (let v = 1; v <= 3; v++) {
        const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=${v}`, {
          headers: {
            'x-public-key': project.public_read_key,
          },
        });
        const translations = (await response.json()) as Record<string, string>;
        expect(translations.KEY).toBe(`v${v}`);
      }
    });

    test('should handle versions independently per locale', async () => {
      await helper.signInAsDefaultUser();

      const projectResponse = await helper.createProject({
        name: 'Per Locale Version Project',
        default_locale: 'en',
        enabled_locales: ['en', 'es'],
        public_read_key: 'pk_locale_ver',
      });
      const project = (await projectResponse.json()) as { id: string; public_read_key: string };

      // Create English translations and publish
      await helper.upsertTranslations(project.id, [{ key: 'HELLO', translations: { en: 'Hello EN v1' } }]);
      const enPub = await helper.publishSnapshot(project.id, 'en');
      expect(((await enPub.json()) as { version: number }).version).toBe(1);

      // Create Spanish translations and publish
      await helper.upsertTranslations(project.id, [{ key: 'HELLO', translations: { es: 'Hola ES v1' } }]);
      const esPub = await helper.publishSnapshot(project.id, 'es');
      expect(((await esPub.json()) as { version: number }).version).toBe(1);

      // Publish another English version
      await helper.upsertTranslations(project.id, [{ key: 'HELLO', translations: { en: 'Hello EN v2' } }]);
      const enPub2 = await helper.publishSnapshot(project.id, 'en');
      expect(((await enPub2.json()) as { version: number }).version).toBe(2);

      // Verify English has 2 versions
      const enV1 = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=1`, {
        headers: { 'x-public-key': project.public_read_key },
      });
      expect(((await enV1.json()) as Record<string, string>).HELLO).toBe('Hello EN v1');

      const enV2 = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=2`, {
        headers: { 'x-public-key': project.public_read_key },
      });
      expect(((await enV2.json()) as Record<string, string>).HELLO).toBe('Hello EN v2');

      // Spanish should only have version 1
      const esV1 = await helper.app.request(`/api/v1/projects/${project.id}/translations/es?v=1`, {
        headers: { 'x-public-key': project.public_read_key },
      });
      expect(((await esV1.json()) as Record<string, string>).HELLO).toBe('Hola ES v1');

      // Spanish version 2 should not exist
      const esV2 = await helper.app.request(`/api/v1/projects/${project.id}/translations/es?v=2`, {
        headers: { 'x-public-key': project.public_read_key },
      });
      expect(esV2.status).toBe(404);
    });

    test(
      'should handle large versioned snapshots efficiently',
      async () => {
        await helper.signInAsDefaultUser();

        const projectResponse = await helper.createProject({
          name: 'Large Version Project',
          default_locale: 'en',
          enabled_locales: ['en'],
          public_read_key: 'pk_large_ver',
        });
        const project = (await projectResponse.json()) as { id: string; public_read_key: string };
        const translationsCount = 10_000;

        // Create all translations in a single batch request
        const translationEntries = Array.from({ length: translationsCount }, (_, i) => ({
          key: `KEY.${i}`,
          translations: { en: `Value ${i}` },
        }));

        await helper.upsertTranslations(project.id, translationEntries);

        // Publish snapshot
        const publishResponse = await helper.publishSnapshot(project.id, 'en');
        expect(publishResponse.status).toBe(201);
        const publishBody = (await publishResponse.json()) as { version: number; translation_count: number };
        expect(publishBody.version).toBe(1);
        expect(publishBody.translation_count).toBe(translationsCount);

        // Measure versioned fetch performance (should be faster than live - single indexed JSONB read)
        const startTime = performance.now();
        const response = await helper.app.request(`/api/v1/projects/${project.id}/translations/en?v=1`, {
          headers: {
            'x-public-key': project.public_read_key,
          },
        });
        const endTime = performance.now();

        expect(response.status).toBe(200);

        const translations = (await response.json()) as Record<string, string>;
        expect(Object.keys(translations)).toHaveLength(translationsCount);

        // Versioned fetch should be fast (under 50ms - single indexed JSONB read)
        const elapsedTime = endTime - startTime;
        expect(elapsedTime).toBeLessThan(50);

        console.log(`✨ Fetched ${translationsCount} versioned translations in ${elapsedTime.toFixed(2)}ms`);
      },
      { timeout: 15000 },
    );
  });
});
