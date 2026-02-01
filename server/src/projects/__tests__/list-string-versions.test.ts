import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import assert from 'node:assert';
import path from 'node:path';

import { APP_API_BASE_PATH } from '../../constants/common';
import { ROUTE_NAME } from '../constants';
import TestHelper from '../../__tests__/test-helper';
import { ListStringVersionsResponseSchema, ProjectResponseSchema } from '../schemas';

const BASE_PATH = path.join(APP_API_BASE_PATH, ROUTE_NAME);

describe('List String Versions Integration Tests', () => {
  const helper = new TestHelper();

  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  describe('GET /:projectId/strings/:stringKey/versions', () => {
    test('should return version history for a string with draft and published versions', async () => {
      const projectResponse = await helper.createProject({
        name: 'Version History Test Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US', 'es-ES'],
        public_read_key: 'pk_version_test_001',
      });
      expect(projectResponse.status).toBe(201);
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      const upsertResponse1 = await helper.upsertTranslations(project.id, [
        {
          key: 'HOME.TITLE',
          context: 'Home page title',
          translations: { 'en-US': 'Welcome', 'es-ES': 'Bienvenido' },
        },
      ]);
      expect(upsertResponse1.status).toBe(200);

      const publishResult1 = await helper.publishSnapshot(project.id, 'en-US');
      expect(publishResult1.status).toBe(201);
      const publishResult2 = await helper.publishSnapshot(project.id, 'es-ES');
      expect(publishResult2.status).toBe(201);

      // Setup: Update translations and publish again
      const upsertResponse2 = await helper.upsertTranslations(project.id, [
        {
          key: 'HOME.TITLE',
          translations: { 'en-US': 'Welcome!', 'es-ES': 'Bienvenido!' },
        },
      ]);
      expect(upsertResponse2.status).toBe(200);
      const publishResult3 = await helper.publishSnapshot(project.id, 'en-US');
      expect(publishResult3.status).toBe(201);
      const publishResult4 = await helper.publishSnapshot(project.id, 'es-ES');
      expect(publishResult4.status).toBe(201);

      // Setup: Update draft
      const upsertResponse3 = await helper.upsertTranslations(project.id, [
        {
          key: 'HOME.TITLE',
          translations: { 'en-US': 'Welcome to the App', 'es-ES': 'Bienvenido a la App' },
        },
      ]);
      expect(upsertResponse3.status).toBe(200);

      // Test: Get version history
      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`${BASE_PATH}/${project.id}/strings/HOME.TITLE/versions`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = ListStringVersionsResponseSchema.parse(await response.json());

      expect(data.locales).toHaveLength(2);

      // Verify en-US locale
      const enLocale = data.locales.find(l => l.locale === 'en-US');
      assert(enLocale, 'Expected en-US locale to exist');
      assert(enLocale.draft, 'Expected en-US draft to exist');
      expect(enLocale.draft.value).toBe('Welcome to the App');
      expect(enLocale.versions).toHaveLength(2);
      // Versions should be sorted DESC (newest first)
      const enVersion0 = enLocale.versions[0];
      assert(enVersion0, 'Expected en-US version 0 to exist');
      expect(enVersion0.version).toBe(2);
      expect(enVersion0.value).toBe('Welcome!');
      const enVersion1 = enLocale.versions[1];
      assert(enVersion1, 'Expected en-US version 1 to exist');
      expect(enVersion1.version).toBe(1);
      expect(enVersion1.value).toBe('Welcome');

      // Verify es-ES locale
      const esLocale = data.locales.find(l => l.locale === 'es-ES');
      assert(esLocale, 'Expected es-ES locale to exist');
      assert(esLocale.draft, 'Expected es-ES draft to exist');
      expect(esLocale.draft.value).toBe('Bienvenido a la App');
      expect(esLocale.versions).toHaveLength(2);
    });

    test('should filter by locale when locale query param is provided', async () => {
      const projectResponse = await helper.createProject({
        name: 'Locale Filter Test Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US', 'fr-FR'],
        public_read_key: 'pk_locale_filter_test',
      });
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      const upsertResponse = await helper.upsertTranslations(project.id, [
        {
          key: 'NAV.HOME',
          translations: { 'en-US': 'Home', 'fr-FR': 'Accueil' },
        },
      ]);
      expect(upsertResponse.status).toBe(200);
      const publishResult1 = await helper.publishSnapshot(project.id, 'en-US');
      expect(publishResult1.status).toBe(201);
      const publishResult2 = await helper.publishSnapshot(project.id, 'fr-FR');
      expect(publishResult2.status).toBe(201);

      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`${BASE_PATH}/${project.id}/strings/NAV.HOME/versions?locale=en-US`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = ListStringVersionsResponseSchema.parse(await response.json());

      expect(data.locales).toHaveLength(1);
      const locale = data.locales[0];
      assert(locale, 'Expected locale to exist');
      expect(locale.locale).toBe('en-US');
    });

    test('should return empty versions array when no snapshots exist', async () => {
      const projectResponse = await helper.createProject({
        name: 'No Snapshots Test Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_no_snapshots_test',
      });
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      // Add translations but don't publish
      const upsertResponse = await helper.upsertTranslations(project.id, [
        {
          key: 'FOOTER.COPYRIGHT',
          translations: { 'en-US': '© 2026 Test Company' },
        },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`${BASE_PATH}/${project.id}/strings/FOOTER.COPYRIGHT/versions`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = ListStringVersionsResponseSchema.parse(await response.json());

      const locale = data.locales[0];
      assert(locale, 'Expected locale to exist');
      assert(locale.draft, 'Expected draft to exist');
      expect(locale.draft.value).toBe('© 2026 Test Company');
      expect(locale.versions).toHaveLength(0);
      expect(locale.pagination.totalVersions).toBe(0);
    });

    // T008: Write server test for version history pagination
    test('should paginate version history correctly', async () => {
      const projectResponse = await helper.createProject({
        name: 'Pagination Test Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_pagination_test',
      });
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      // Create multiple snapshots
      for (let i = 1; i <= 5; i++) {
        const upsertResponse = await helper.upsertTranslations(project.id, [
          {
            key: 'PAGINATED.STRING',
            translations: { 'en-US': `Version ${i}` },
          },
        ]);
        expect(upsertResponse.status).toBe(200);
        const publishResult = await helper.publishSnapshot(project.id, 'en-US');
        expect(publishResult.status).toBe(201);
      }

      // Update draft
      const upsertDraftResponse = await helper.upsertTranslations(project.id, [
        {
          key: 'PAGINATED.STRING',
          translations: { 'en-US': 'Current Draft' },
        },
      ]);
      expect(upsertDraftResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();

      // Request first page with pageSize=2
      const page1Response = await helper.app.request(
        `${BASE_PATH}/${project.id}/strings/PAGINATED.STRING/versions?pageSize=2&page=1`,
        { method: 'GET', headers },
      );
      expect(page1Response.status).toBe(200);
      const page1 = ListStringVersionsResponseSchema.parse(await page1Response.json());

      const page1Locale = page1.locales[0];
      assert(page1Locale, 'Expected page1 locale to exist');
      assert(page1Locale.draft, 'Expected page1 draft to exist');
      expect(page1Locale.versions).toHaveLength(2);
      const page1Version0 = page1Locale.versions[0];
      assert(page1Version0, 'Expected page1 version 0 to exist');
      expect(page1Version0.version).toBe(5); // Newest first
      const page1Version1 = page1Locale.versions[1];
      assert(page1Version1, 'Expected page1 version 1 to exist');
      expect(page1Version1.version).toBe(4);
      expect(page1Locale.pagination.page).toBe(1);
      expect(page1Locale.pagination.pageSize).toBe(2);
      expect(page1Locale.pagination.totalVersions).toBe(5);
      expect(page1Locale.pagination.hasMore).toBe(true);
      // Draft should always be included
      expect(page1Locale.draft.value).toBe('Current Draft');

      // Request second page
      const page2Response = await helper.app.request(
        `${BASE_PATH}/${project.id}/strings/PAGINATED.STRING/versions?pageSize=2&page=2`,
        { method: 'GET', headers },
      );
      expect(page2Response.status).toBe(200);
      const page2 = ListStringVersionsResponseSchema.parse(await page2Response.json());

      const page2Locale = page2.locales[0];
      assert(page2Locale, 'Expected page2 locale to exist');
      expect(page2Locale.versions).toHaveLength(2);
      const page2Version0 = page2Locale.versions[0];
      assert(page2Version0, 'Expected page2 version 0 to exist');
      expect(page2Version0.version).toBe(3);
      const page2Version1 = page2Locale.versions[1];
      assert(page2Version1, 'Expected page2 version 1 to exist');
      expect(page2Version1.version).toBe(2);
      expect(page2Locale.pagination.hasMore).toBe(true);

      // Request third (last) page
      const page3Response = await helper.app.request(
        `${BASE_PATH}/${project.id}/strings/PAGINATED.STRING/versions?pageSize=2&page=3`,
        { method: 'GET', headers },
      );
      expect(page3Response.status).toBe(200);
      const page3 = ListStringVersionsResponseSchema.parse(await page3Response.json());

      const page3Locale = page3.locales[0];
      assert(page3Locale, 'Expected page3 locale to exist');
      expect(page3Locale.versions).toHaveLength(1);
      const page3Version0 = page3Locale.versions[0];
      assert(page3Version0, 'Expected page3 version 0 to exist');
      expect(page3Version0.version).toBe(1);
      expect(page3Locale.pagination.hasMore).toBe(false);
    });

    test('should use default pagination values when not specified', async () => {
      const projectResponse = await helper.createProject({
        name: 'Default Pagination Test',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_default_pagination',
      });
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      const upsertResponse = await helper.upsertTranslations(project.id, [
        {
          key: 'DEFAULT.PAGINATION',
          translations: { 'en-US': 'Test value' },
        },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`${BASE_PATH}/${project.id}/strings/DEFAULT.PAGINATION/versions`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = ListStringVersionsResponseSchema.parse(await response.json());

      const locale = data.locales[0];
      assert(locale, 'Expected locale to exist');
      expect(locale.pagination.page).toBe(1);
      expect(locale.pagination.pageSize).toBe(20); // Default page size
    });

    // T009: Write server test for 404/403 error cases
    test('should return 404 when string key does not exist', async () => {
      const projectResponse = await helper.createProject({
        name: '404 String Test Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_404_string_test',
      });
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`${BASE_PATH}/${project.id}/strings/NONEXISTENT.KEY/versions`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(404);
    });

    test('should return 404 when project does not exist', async () => {
      const headers = await helper.getDefaultUserHeaders();
      const fakeProjectId = '00000000-0000-0000-0000-000000000000';

      const response = await helper.app.request(`${BASE_PATH}/${fakeProjectId}/strings/SOME.KEY/versions`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(404);
    });

    test('should return 403 when user does not own the project', async () => {
      // Create project with default user
      const projectResponse = await helper.createProject({
        name: '403 Test Project',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_403_test',
      });
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      // Create a second user
      const signUpResponse = await helper.signUpUser('other@example.com', 'Other User');
      expect(signUpResponse.status).toBe(201);
      const otherUserSignIn = await helper.signInUser('other@example.com');
      expect(otherUserSignIn.status).toBe(200);
      const { token } = (await otherUserSignIn.json()) as { token: string };
      const otherUserCookies = otherUserSignIn.headers.get('set-cookie') ?? '';

      // Try to access the project with the other user
      const response = await helper.app.request(`${BASE_PATH}/${project.id}/strings/SOME.KEY/versions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Cookie: otherUserCookies,
        },
      });

      // Should return 404 (hiding that the project exists) or 403
      expect([403, 404]).toContain(response.status);
    });

    test('should return 404 when not authenticated', async () => {
      const response = await helper.app.request(`${BASE_PATH}/some-project-id/strings/SOME.KEY/versions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(404);
    });

    test('should reject invalid page number', async () => {
      const projectResponse = await helper.createProject({
        name: 'Invalid Page Test',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_invalid_page',
      });
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      const upsertResponse = await helper.upsertTranslations(project.id, [
        {
          key: 'VALIDATION.TEST',
          translations: { 'en-US': 'Test' },
        },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(`${BASE_PATH}/${project.id}/strings/VALIDATION.TEST/versions?page=-1`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(400);
    });

    test('should reject pageSize greater than 100', async () => {
      const projectResponse = await helper.createProject({
        name: 'Max PageSize Test',
        default_locale: 'en-US',
        enabled_locales: ['en-US'],
        public_read_key: 'pk_max_pagesize',
      });
      const project = ProjectResponseSchema.parse(await projectResponse.json());

      const upsertResponse = await helper.upsertTranslations(project.id, [
        {
          key: 'PAGESIZE.TEST',
          translations: { 'en-US': 'Test' },
        },
      ]);
      expect(upsertResponse.status).toBe(200);

      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request(
        `${BASE_PATH}/${project.id}/strings/PAGESIZE.TEST/versions?pageSize=101`,
        { method: 'GET', headers },
      );

      expect(response.status).toBe(400);
    });
  });
});
