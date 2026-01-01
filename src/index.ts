import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { compress } from 'hono/compress';
import { secureHeaders } from 'hono/secure-headers';
import { showRoutes } from 'hono/dev';
import { etag } from 'hono/etag';

import { injectRequestContext, type HonoEnvironment } from './context';
import { loggingMiddleware } from './middleware/logging';
import { HEALTH_ROUTER_NAME, healthRouter } from './health';
import env from './env';
import { docsRouter } from './docs';
import { PROJECTS_ROUTE_NAME, projectsRouter } from './projects';
import { FileStorageDatabase, type Database } from './db';

const { DEBUG } = env;
const REQUEST_ID_HEADER_NAME = 'wt-request-id';

async function createApp(overrides?: { database: Database }) {
  const app = new Hono<HonoEnvironment>();

  app
    .use(requestId({ headerName: REQUEST_ID_HEADER_NAME }))
    .use(compress())
    .use(secureHeaders())
    .use(loggingMiddleware())
    .use(etag())
    .use(injectRequestContext({ db: overrides?.database ?? (await FileStorageDatabase.setup('file-storage')) }))
    .route(HEALTH_ROUTER_NAME, healthRouter)
    .route(PROJECTS_ROUTE_NAME, projectsRouter)
    .route('/', docsRouter(app));

  if (DEBUG) {
    showRoutes(app, { verbose: false });
  }

  return app;
}

const app = await createApp();

export default app;
