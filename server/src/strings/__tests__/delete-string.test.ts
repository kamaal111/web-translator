import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';

import TestHelper from '../../__tests__/test-helper';
import { ProjectResponseSchema } from '../../projects/schemas';
import { GetTranslationsResponseSchema, ListStringsResponseSchema } from '../schemas';

const helper = new TestHelper();

describe('DELETE /app-api/v1/s/:projectId/strings/:stringKey', () => {
  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  beforeEach(async () => {
    await helper.signInAsDefaultUser();
  });

  const setupProject = async (locales: string[] = ['en', 'es']) => {
    const projectResponse = await helper.createProject({
      name: `Delete String Project ${Date.now()}`,
      default_locale: locales[0] ?? 'en',
      enabled_locales: locales,
      public_read_key: `pk_${Date.now()}`,
    });
    expect(projectResponse.status).toBe(201);
    return ProjectResponseSchema.parse(await projectResponse.json());
  };

  const fetchStrings = async (projectId: string) => {
    const headers = await helper.getDefaultUserHeaders();
    const response = await helper.app.request(`/app-api/v1/s/${projectId}`, { method: 'GET', headers });
    expect(response.status).toBe(200);
    return ListStringsResponseSchema.parse(await response.json());
  };

  const fetchPublishedTranslations = async (projectId: string, locale: string, publicKey: string) => {
    const response = await helper.app.request(`/api/v1/projects/${projectId}/translations/${locale}`, {
      headers: { 'x-public-key': publicKey },
    });
    expect(response.status).toBe(200);
    return GetTranslationsResponseSchema.parse(await response.json());
  };

  const createHeadersForUser = async (email: string, name: string) => {
    const signUpResponse = await helper.signUpUser(email, name);
    expect(signUpResponse.status).toBe(201);

    const signInResponse = await helper.signInUser(email);
    expect(signInResponse.status).toBe(200);
    const { token } = (await signInResponse.json()) as { token: string };
    const cookies = signInResponse.headers.get('set-cookie') ?? '';

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Cookie: cookies,
    };
  };

  test('should delete a string successfully', async () => {
    const project = await setupProject();
    const upsertResponse = await helper.upsertTranslations(project.id, [
      { key: 'HOME.TITLE', translations: { en: 'Welcome', es: 'Bienvenido' } },
    ]);
    expect(upsertResponse.status).toBe(200);

    const headers = await helper.getDefaultUserHeaders();
    const deleteResponse = await helper.app.request(`/app-api/v1/s/${project.id}/strings/HOME.TITLE`, {
      method: 'DELETE',
      headers,
    });

    expect(deleteResponse.status).toBe(200);
    expect(await deleteResponse.json()).toMatchObject({
      deleted: {
        key: 'HOME.TITLE',
        deletedAt: expect.any(String),
      },
    });

    expect(await fetchStrings(project.id)).toEqual([]);
  });

  test('should return 404 when the string does not exist', async () => {
    const project = await setupProject();
    const headers = await helper.getDefaultUserHeaders();

    const deleteResponse = await helper.app.request(`/app-api/v1/s/${project.id}/strings/MISSING.KEY`, {
      method: 'DELETE',
      headers,
    });

    expect(deleteResponse.status).toBe(404);
  });

  test('should return 404 when not authenticated', async () => {
    const project = await setupProject();

    const deleteResponse = await helper.app.request(`/app-api/v1/s/${project.id}/strings/HOME.TITLE`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(404);
  });

  test('should return 404 when another user tries to delete the string', async () => {
    const project = await setupProject();
    const upsertResponse = await helper.upsertTranslations(project.id, [
      { key: 'HOME.TITLE', translations: { en: 'Welcome' } },
    ]);
    expect(upsertResponse.status).toBe(200);

    const otherUserHeaders = await createHeadersForUser(`other-${Date.now()}@example.com`, 'Other Delete User');

    const deleteResponse = await helper.app.request(`/app-api/v1/s/${project.id}/strings/HOME.TITLE`, {
      method: 'DELETE',
      headers: otherUserHeaders,
    });

    expect(deleteResponse.status).toBe(404);
  });

  test('should remove the deleted string translations while preserving other strings', async () => {
    const project = await setupProject(['en', 'es']);
    const upsertResponse = await helper.upsertTranslations(project.id, [
      { key: 'HOME.TITLE', translations: { en: 'Welcome', es: 'Bienvenido' } },
      { key: 'HOME.SUBTITLE', translations: { en: 'Subtitle', es: 'Subtitulo' } },
    ]);
    expect(upsertResponse.status).toBe(200);

    const headers = await helper.getDefaultUserHeaders();
    const deleteResponse = await helper.app.request(`/app-api/v1/s/${project.id}/strings/HOME.TITLE`, {
      method: 'DELETE',
      headers,
    });
    expect(deleteResponse.status).toBe(200);

    const remainingStrings = await fetchStrings(project.id);
    expect(remainingStrings).toHaveLength(1);
    expect(remainingStrings[0]?.key).toBe('HOME.SUBTITLE');
    expect(remainingStrings[0]?.translations).toEqual({ en: 'Subtitle', es: 'Subtitulo' });

    const publishResponse = await helper.publishSnapshot(project.id, 'en');
    expect(publishResponse.status).toBe(201);
    const publishedTranslations = await fetchPublishedTranslations(project.id, 'en', project.public_read_key);
    expect(publishedTranslations['HOME.TITLE']).toBeUndefined();
    expect(publishedTranslations['HOME.SUBTITLE']).toBe('Subtitle');
  });
});
