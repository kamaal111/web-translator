import { describe, expect, test, beforeAll, afterAll } from 'bun:test';

import TestHelper from '../../__tests__/test-helper';

describe('Web Router', () => {
  const helper = new TestHelper();

  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  describe('SPA routing', () => {
    test('should serve HTML for root path when authenticated', async () => {
      const headers = await helper.getDefaultUserHeaders();
      const response = await helper.app.request('/', {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      const html = await response.text();
      expect(html.toLowerCase()).toContain('<!doctype html>');
    });

    test('should redirect to /login when accessing root path without authentication', async () => {
      const response = await helper.app.request('/', {
        method: 'GET',
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/login');
    });

    test('should serve HTML for /login path without authentication', async () => {
      const response = await helper.app.request('/login', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      const html = await response.text();
      expect(html.toLowerCase()).toContain('<!doctype html>');
    });

    test('should serve HTML for /projects/:id path when authenticated', async () => {
      const headers = await helper.getDefaultUserHeaders();
      const projectId = '018d8f28-1234-7890-abcd-ef1234567890';
      const response = await helper.app.request(`/projects/${projectId}`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      const html = await response.text();
      expect(html.toLowerCase()).toContain('<!doctype html>');
    });

    test('should redirect to /login when accessing /projects/:id without authentication', async () => {
      const projectId = '018d8f28-1234-7890-abcd-ef1234567890';
      const response = await helper.app.request(`/projects/${projectId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/login');
    });

    test('should serve HTML for /projects/:id/bulk-editor path when authenticated', async () => {
      const headers = await helper.getDefaultUserHeaders();
      const projectId = '018d8f28-1234-7890-abcd-ef1234567890';
      const response = await helper.app.request(`/projects/${projectId}/bulk-editor`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      const html = await response.text();
      expect(html.toLowerCase()).toContain('<!doctype html>');
    });

    test('should redirect to /login when accessing /projects/:id/bulk-editor without authentication', async () => {
      const projectId = '018d8f28-1234-7890-abcd-ef1234567890';
      const response = await helper.app.request(`/projects/${projectId}/bulk-editor`, {
        method: 'GET',
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/login');
    });

    test('should not serve HTML for API routes', async () => {
      const response = await helper.app.request('/app-api/v1/p', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(404);
      const contentType = response.headers.get('content-type');
      if (contentType) {
        expect(contentType).toContain('application/json');
      }
    });
  });
});
