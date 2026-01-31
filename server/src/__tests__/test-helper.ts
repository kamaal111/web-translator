import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import * as schema from '../db/schema';
import type { DrizzleDatabase } from '../db';
import { createApp } from '..';
import env from '../env';
import { AUTH_BASE_PATH } from '../auth';
import { PublishSnapshotResponseSchema, type PublishSnapshotResponse } from '../strings/routes/publish-snapshot';
import type { CreateProjectPayload } from '../projects/schemas';

const { DATABASE_URL } = env;

const DEFAULT_USER_EMAIL = 'test@example.com';
const DEFAULT_USER_PASSWORD = 'TestPassword123!';
const DEFAULT_USER_NAME = 'Test User';

type TranslationEntry = {
  key: string;
  context?: string | null;
  translations: Record<string, string>;
};

class TestHelper {
  private _app: ReturnType<typeof createApp> | null = null;
  private dbCleanUp: (() => Promise<void>) | null = null;

  get app() {
    const app = this._app;
    if (app == null) {
      throw new Error('App not initialized — call TestHelper.beforeAll() before accessing the app');
    }

    return app;
  }

  beforeAll = async () => {
    const { db, cleanUpPool, name } = await this.createDbContext();

    this.dbCleanUp = async () => {
      try {
        await cleanUpPool.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${name}'
        AND pid <> pg_backend_pid()
      `);

        await cleanUpPool.query(`DROP DATABASE IF EXISTS "${name}"`);
        await cleanUpPool.end();
      } catch (error) {
        console.error(`Failed to cleanup test database ${name}:`, error);
        throw error;
      }
    };

    this._app = createApp({ drizzle: db });

    await this.signUpUser(DEFAULT_USER_EMAIL, DEFAULT_USER_NAME);
  };

  afterAll = async () => {
    await this.dbCleanUp?.();
  };

  signUpUser = async (email: string, name: string) => {
    return this.app.request(`${AUTH_BASE_PATH}/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: DEFAULT_USER_PASSWORD,
        name,
      }),
    });
  };

  signInUser = async (email: string) => {
    return this.app.request(`${AUTH_BASE_PATH}/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: DEFAULT_USER_PASSWORD,
      }),
    });
  };

  signInAsDefaultUser = async () => {
    return this.signInUser(DEFAULT_USER_EMAIL);
  };

  getDefaultUserHeaders = async () => {
    const signInResponse = await this.signInAsDefaultUser();
    if (signInResponse.status !== 200) {
      throw new Error(`Failed to sign in: ${signInResponse.status} ${await signInResponse.text()}`);
    }
    const { token } = (await signInResponse.json()) as { token: string };
    const cookies = signInResponse.headers.get('set-cookie') ?? '';

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Cookie: cookies,
    };
  };

  createProject = async (data: CreateProjectPayload) => {
    const headers = await this.getDefaultUserHeaders();
    return this.app.request('/app-api/v1/p', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  };

  upsertTranslations = async (projectId: string, translations: TranslationEntry[]) => {
    const headers = await this.getDefaultUserHeaders();
    return this.app.request(`/app-api/v1/s/${projectId}/translations`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ translations }),
    });
  };

  publishSnapshot = async (
    projectId: string,
    locale: string,
  ): Promise<{ body: PublishSnapshotResponse; status: number }> => {
    const headers = await this.getDefaultUserHeaders();
    const response = await this.app.request(`/app-api/v1/s/${projectId}/translations/${locale}/publish`, {
      method: 'POST',
      headers,
    });

    return { body: PublishSnapshotResponseSchema.parse(await response.json()), status: response.status };
  };

  private createDbContext = async (): Promise<{ db: DrizzleDatabase; cleanUpPool: Pool; name: string }> => {
    const postgresDbUrl = new URL(DATABASE_URL);
    postgresDbUrl.pathname = '/postgres';
    const masterConnectionString = postgresDbUrl.toString();
    const masterPool = new Pool({ connectionString: masterConnectionString });
    const testDbName = `test_db_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      await masterPool.query(`CREATE DATABASE "${testDbName}"`);
    } catch (error) {
      await masterPool.end();
      throw new Error(`Failed to create test database: ${error}`);
    }

    await masterPool.end();

    const testUrl = new URL(DATABASE_URL);
    testUrl.pathname = `/${testDbName}`;
    const connectionString = testUrl.toString();
    const testPool = new Pool({ connectionString });
    const testDb = drizzle(testPool, { schema });
    const cleanUpPool = new Pool({ connectionString: masterConnectionString });

    try {
      await migrate(testDb, { migrationsFolder: './drizzle' });
    } catch (error) {
      await testPool.end();

      await cleanUpPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
      await cleanUpPool.end();
      throw new Error(`Failed to run migrations: ${error}`);
    }

    return { db: testDb, cleanUpPool, name: testDbName };
  };
}

export default TestHelper;
