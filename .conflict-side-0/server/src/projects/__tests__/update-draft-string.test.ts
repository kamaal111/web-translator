import assert from 'node:assert';

import { beforeAll, afterAll, describe, test, expect } from 'bun:test';
import TestHelper from '../../__tests__/test-helper';

const helper = new TestHelper();

describe('PATCH /app-api/v1/p/:projectId/strings/:stringKey/translations', () => {
  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  test('should update draft translation successfully', async () => {
    const projectResponse = await helper.createProject({
      name: 'Test Project',
      default_locale: 'en',
      enabled_locales: ['en', 'es'],
      public_read_key: 'pk_test_001',
    });
    expect(projectResponse.status).toBe(201);
    const { id: projectId } = (await projectResponse.json()) as { id: string };

    const upsertResponse = await helper.upsertTranslations(projectId, [
      {
        key: 'HOME.TITLE',
        context: 'Homepage title',
        translations: {
          en: 'Welcome',
          es: 'Bienvenido',
        },
      },
    ]);
    expect(upsertResponse.status).toBe(200);

    const headers = await helper.getDefaultUserHeaders();
    const updateResponse = await helper.app.request(`/app-api/v1/p/${projectId}/strings/HOME.TITLE/translations`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        translations: {
          en: 'New Welcome Message',
          es: 'Nuevo Mensaje de Bienvenida',
        },
      }),
    });

    expect(updateResponse.status).toBe(200);
    const result = await updateResponse.json();
    expect(result).toMatchObject({
      updated: expect.arrayContaining([
        expect.objectContaining({
          locale: 'en',
          value: 'New Welcome Message',
        }),
        expect.objectContaining({
          locale: 'es',
          value: 'Nuevo Mensaje de Bienvenida',
        }),
      ]),
    });
  });

  test('should return 404 for non-existent string', async () => {
    const projectResponse = await helper.createProject({
      name: 'Test Project 2',
      default_locale: 'en',
      enabled_locales: ['en'],
      public_read_key: 'pk_test_002',
    });
    expect(projectResponse.status).toBe(201);
    const { id: projectId } = (await projectResponse.json()) as { id: string };

    const headers = await helper.getDefaultUserHeaders();
    const updateResponse = await helper.app.request(
      `/app-api/v1/p/${projectId}/strings/NON_EXISTENT_KEY/translations`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          translations: { en: 'Some value' },
        }),
      },
    );

    expect(updateResponse.status).toBe(404);
  });

  test('should return 404 for unauthorized access (to avoid leaking project existence)', async () => {
    const projectResponse = await helper.createProject({
      name: 'Test Project 3',
      default_locale: 'en',
      enabled_locales: ['en'],
      public_read_key: 'pk_test_003',
    });
    expect(projectResponse.status).toBe(201);
    const { id: projectId } = (await projectResponse.json()) as { id: string };

    const upsertResponse = await helper.upsertTranslations(projectId, [
      {
        key: 'HOME.TITLE',
        translations: { en: 'Welcome' },
      },
    ]);
    expect(upsertResponse.status).toBe(200);

    const otherUserResponse = await helper.signUpUser('other@example.com', 'Other User');
    expect(otherUserResponse.status).toBe(201);

    const otherUserSignIn = await helper.signInUser('other@example.com');
    expect(otherUserSignIn.status).toBe(200);
    const { token } = (await otherUserSignIn.json()) as { token: string };
    const cookies = otherUserSignIn.headers.get('set-cookie') ?? '';

    const updateResponse = await helper.app.request(`/app-api/v1/p/${projectId}/strings/HOME.TITLE/translations`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: cookies,
      },
      body: JSON.stringify({
        translations: { en: 'Hacked!' },
      }),
    });

    expect(updateResponse.status).toBe(404);
  });

  test('should detect concurrent modification conflict', async () => {
    const projectResponse = await helper.createProject({
      name: 'Test Project Conflict',
      default_locale: 'en',
      enabled_locales: ['en'],
      public_read_key: 'pk_test_conflict',
    });
    expect(projectResponse.status).toBe(201);
    const { id: projectId } = (await projectResponse.json()) as { id: string };

    const upsertResponse = await helper.upsertTranslations(projectId, [
      {
        key: 'HOME.TITLE',
        translations: { en: 'Welcome' },
      },
    ]);
    expect(upsertResponse.status).toBe(200);

    const headers = await helper.getDefaultUserHeaders();
    const firstUpdate = await helper.app.request(`/app-api/v1/p/${projectId}/strings/HOME.TITLE/translations`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        translations: { en: 'First Update' },
      }),
    });
    expect(firstUpdate.status).toBe(200);
    const firstResult = (await firstUpdate.json()) as {
      updated: Array<{ updatedAt: string }>;
    };
    const firstTranslation = firstResult.updated[0];
    assert(firstTranslation, 'Expected at least one updated translation');
    const firstUpdatedAt = firstTranslation.updatedAt;

    const secondUpdate = await helper.app.request(`/app-api/v1/p/${projectId}/strings/HOME.TITLE/translations`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        translations: { en: 'Second Update' },
      }),
    });
    expect(secondUpdate.status).toBe(200);

    const conflictUpdate = await helper.app.request(`/app-api/v1/p/${projectId}/strings/HOME.TITLE/translations`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        translations: { en: 'Conflicting Update' },
        ifUnmodifiedSince: firstUpdatedAt,
      }),
    });

    expect(conflictUpdate.status).toBe(409);
    const conflictResult = await conflictUpdate.json();
    expect(conflictResult).toMatchObject({
      code: 'CONCURRENT_MODIFICATION',
      message: expect.stringContaining('modified this translation recently'),
      context: expect.objectContaining({
        conflictDetails: expect.objectContaining({
          locale: 'en',
          lastModifiedBy: expect.objectContaining({
            name: 'Test User',
          }),
        }),
      }),
    });
  });

  test('should reject empty translation values', async () => {
    const projectResponse = await helper.createProject({
      name: 'Test Project Validation',
      default_locale: 'en',
      enabled_locales: ['en'],
      public_read_key: 'pk_test_validation',
    });
    expect(projectResponse.status).toBe(201);
    const { id: projectId } = (await projectResponse.json()) as { id: string };

    const upsertResponse = await helper.upsertTranslations(projectId, [
      {
        key: 'HOME.TITLE',
        translations: { en: 'Welcome' },
      },
    ]);
    expect(upsertResponse.status).toBe(200);

    const headers = await helper.getDefaultUserHeaders();
    const updateResponse = await helper.app.request(`/app-api/v1/p/${projectId}/strings/HOME.TITLE/translations`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        translations: { en: '' },
      }),
    });

    expect(updateResponse.status).toBe(400);
    const result = await updateResponse.json();
    expect(result).toMatchObject({
      success: false,
      error: expect.arrayContaining([
        expect.objectContaining({
          code: 'too_small',
          message: expect.stringContaining('cannot be empty'),
        }),
      ]),
    });
  });

  test('should reject translations for disabled locales', async () => {
    const projectResponse = await helper.createProject({
      name: 'Test Project Locale Validation',
      default_locale: 'en',
      enabled_locales: ['en'],
      public_read_key: 'pk_test_locale_validation',
    });
    expect(projectResponse.status).toBe(201);
    const { id: projectId } = (await projectResponse.json()) as { id: string };

    const upsertResponse = await helper.upsertTranslations(projectId, [
      {
        key: 'HOME.TITLE',
        translations: { en: 'Welcome' },
      },
    ]);
    expect(upsertResponse.status).toBe(200);

    const headers = await helper.getDefaultUserHeaders();
    const updateResponse = await helper.app.request(`/app-api/v1/p/${projectId}/strings/HOME.TITLE/translations`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        translations: { fr: 'Bienvenue' },
      }),
    });

    expect(updateResponse.status).toBe(400);
    const result = await updateResponse.json();
    expect(result).toMatchObject({
      message: expect.stringContaining('Validation'),
    });
  });
});
