import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import assert from 'node:assert';
import path from 'node:path';

import { APP_API_BASE_PATH } from '../../constants/common';
import { ROUTE_NAME } from '../constants';
import TestHelper from '../../__tests__/test-helper';

const BASE_PATH = path.join(APP_API_BASE_PATH, ROUTE_NAME);

describe('POST /projects/:projectId/publish', () => {
  const helper = new TestHelper();

  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  describe('basic publish', () => {
    test('should publish all enabled locales when no locales specified', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish All Locales',
        default_locale: 'en',
        enabled_locales: ['en', 'es'],
        public_read_key: 'pk_publish_all_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(projectId, [
        {
          key: 'HOME.TITLE',
          context: 'Home page title',
          translations: { en: 'Welcome', es: 'Bienvenido' },
        },
        {
          key: 'HOME.SUBTITLE',
          translations: { en: 'Manage translations', es: 'Gestionar traducciones' },
        },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();
      const publishResponse = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      expect(publishResponse.status).toBe(200);
      const result = (await publishResponse.json()) as {
        published: Array<{
          locale: string;
          version: number;
          snapshotId: string;
          stringCount: number;
          createdAt: string;
        }>;
        createdBy: { id: string; name: string };
      };

      expect(result.published).toHaveLength(2);
      expect(result.createdBy).toMatchObject({ name: 'Test User' });

      const enPublished = result.published.find(p => p.locale === 'en');
      assert(enPublished, 'Expected en locale to be published');
      expect(enPublished.version).toBe(1);
      expect(enPublished.stringCount).toBe(2);
      expect(enPublished.snapshotId).toBeDefined();
      expect(enPublished.createdAt).toBeDefined();

      const esPublished = result.published.find(p => p.locale === 'es');
      assert(esPublished, 'Expected es locale to be published');
      expect(esPublished.version).toBe(1);
      expect(esPublished.stringCount).toBe(2);
    });

    test('should create new version on subsequent publishes', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish Versioning',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_publish_versions_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const upsertResponse1 = await helper.upsertTranslations(projectId, [
        { key: 'HOME.TITLE', translations: { en: 'Welcome' } },
      ]);
      expect(upsertResponse1.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();

      const publishResponse1 = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ force: true }),
      });
      expect(publishResponse1.status).toBe(200);
      const result1 = (await publishResponse1.json()) as {
        published: Array<{ version: number; locale: string }>;
      };
      const enResult1 = result1.published.find(p => p.locale === 'en');
      assert(enResult1, 'Expected en locale in first publish');
      expect(enResult1.version).toBe(1);

      const upsertResponse2 = await helper.upsertTranslations(projectId, [
        { key: 'HOME.TITLE', translations: { en: 'Welcome!' } },
      ]);
      expect(upsertResponse2.status).toBe(200);

      const publishResponse2 = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      expect(publishResponse2.status).toBe(200);
      const result2 = (await publishResponse2.json()) as {
        published: Array<{ version: number; locale: string }>;
      };
      const enResult2 = result2.published.find(p => p.locale === 'en');
      assert(enResult2, 'Expected en locale in second publish');
      expect(enResult2.version).toBe(2);
    });

    test('should return 404 for non-existent project', async () => {
      const headers = await helper.getDefaultUserHeaders();
      const publishResponse = await helper.app.request(`${BASE_PATH}/00000000-0000-0000-0000-000000000000/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      expect(publishResponse.status).toBe(404);
    });

    test('should return 404 for unauthorized project access', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish Auth Test',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_publish_auth_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const otherUserResponse = await helper.signUpUser('publish-other@example.com', 'Other User');
      expect(otherUserResponse.status).toBe(201);
      const otherUserSignIn = await helper.signInUser('publish-other@example.com');
      expect(otherUserSignIn.status).toBe(200);
      const { token } = (await otherUserSignIn.json()) as { token: string };
      const cookies = otherUserSignIn.headers.get('set-cookie') ?? '';

      const publishResponse = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Cookie: cookies,
        },
        body: JSON.stringify({}),
      });

      expect(publishResponse.status).toBe(404);
    });
  });

  describe('publishing specific locales', () => {
    test('should publish only specified locales', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish Specific Locales',
        default_locale: 'en',
        enabled_locales: ['en', 'es', 'fr'],
        public_read_key: 'pk_publish_specific_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(projectId, [
        {
          key: 'HOME.TITLE',
          translations: { en: 'Welcome', es: 'Bienvenido', fr: 'Bienvenue' },
        },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();
      const publishResponse = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ locales: ['en', 'es'] }),
      });

      expect(publishResponse.status).toBe(200);
      const result = (await publishResponse.json()) as {
        published: Array<{ locale: string; version: number }>;
      };

      expect(result.published).toHaveLength(2);
      const publishedLocales = result.published.map(p => p.locale).sort();
      expect(publishedLocales).toEqual(['en', 'es']);
    });

    test('should return 400 for disabled locale', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish Disabled Locale',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_publish_disabled_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(projectId, [
        { key: 'HOME.TITLE', translations: { en: 'Welcome' } },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();
      const publishResponse = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ locales: ['fr'] }),
      });

      expect(publishResponse.status).toBe(400);
      const result = await publishResponse.json();
      expect(result).toMatchObject({
        message: expect.stringContaining('not enabled'),
      });
    });
  });

  describe('conflict detection - no changes', () => {
    test('should return 409 when draft matches latest snapshot', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish No Changes',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_publish_nochanges_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(projectId, [
        { key: 'HOME.TITLE', translations: { en: 'Welcome' } },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();

      const publishResponse1 = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      expect(publishResponse1.status).toBe(200);

      const publishResponse2 = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      expect(publishResponse2.status).toBe(409);
      const result = await publishResponse2.json();
      expect(result).toMatchObject({
        code: 'NO_CHANGES_DETECTED',
        message: expect.stringContaining('identical'),
      });
    });

    test('should allow publish with force=true even when no changes', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish Force',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_publish_force_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(projectId, [
        { key: 'HOME.TITLE', translations: { en: 'Welcome' } },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();

      const publishResponse1 = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ force: true }),
      });
      expect(publishResponse1.status).toBe(200);

      const publishResponse2 = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ force: true }),
      });
      expect(publishResponse2.status).toBe(200);
      const result = (await publishResponse2.json()) as {
        published: Array<{ version: number; locale: string }>;
      };
      const enResult = result.published.find(p => p.locale === 'en');
      assert(enResult, 'Expected en locale to be published with force');
      expect(enResult.version).toBe(2);
    });
  });

  describe('atomic operations', () => {
    test('should publish all locales atomically', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish Atomic',
        default_locale: 'en',
        enabled_locales: ['en', 'es'],
        public_read_key: 'pk_publish_atomic_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(projectId, [
        {
          key: 'HOME.TITLE',
          translations: { en: 'Welcome', es: 'Bienvenido' },
        },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();
      const publishResponse = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      expect(publishResponse.status).toBe(200);
      const result = (await publishResponse.json()) as {
        published: Array<{ locale: string; version: number; stringCount: number }>;
      };

      expect(result.published).toHaveLength(2);
      for (const published of result.published) {
        expect(published.version).toBe(1);
        expect(published.stringCount).toBe(1);
      }
    });

    test('should return 400 when project has no draft translations', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish Empty',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_publish_empty_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const headers = await helper.getDefaultUserHeaders();
      const publishResponse = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      expect(publishResponse.status).toBe(400);
      const result = await publishResponse.json();
      expect(result).toMatchObject({
        message: expect.stringContaining('No draft translations'),
      });
    });

    test('draft should remain editable after publishing', async () => {
      const projectResponse = await helper.createProject({
        name: 'Publish Draft Editable',
        default_locale: 'en',
        enabled_locales: ['en'],
        public_read_key: 'pk_publish_editable_001',
      });
      expect(projectResponse.status).toBe(201);
      const { id: projectId } = (await projectResponse.json()) as { id: string };

      const upsertResponse = await helper.upsertTranslations(projectId, [
        { key: 'HOME.TITLE', translations: { en: 'Welcome' } },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();

      const publishResponse = await helper.app.request(`${BASE_PATH}/${projectId}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ force: true }),
      });
      expect(publishResponse.status).toBe(200);

      const updateResponse = await helper.app.request(`${BASE_PATH}/${projectId}/strings/HOME.TITLE/translations`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          translations: { en: 'Updated Welcome' },
        }),
      });
      expect(updateResponse.status).toBe(200);
      const updateResult = (await updateResponse.json()) as {
        updated: Array<{ value: string }>;
      };
      const updatedItem = updateResult.updated[0];
      assert(updatedItem, 'Expected at least one updated translation');
      expect(updatedItem.value).toBe('Updated Welcome');
    });
  });
});
