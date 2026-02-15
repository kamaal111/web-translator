import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { compress } from 'hono/compress';
import { secureHeaders } from 'hono/secure-headers';
import { showRoutes } from 'hono/dev';
import { etag } from 'hono/etag';

import { injectRequestContext, type HonoEnvironment, type InjectedContext } from './context';
import { HEALTH_ROUTER_NAME, healthRouter } from './health';
import env from './env';
import { DOCS_ROUTE_NAME, docsRouter } from './docs';
import { WEB_ROUTE_NAME, webRouter } from './web';
import { APP_API_BASE_PATH } from './constants/common';
import { appApiRouter } from './app-api';
import { PUBLIC_API_BASE_PATH, publicApiRouter } from './public-api';

const { DEBUG } = env;
const REQUEST_ID_HEADER_NAME = 'wt-request-id';

export function createApp(overrides?: Partial<InjectedContext>) {
  const app = new Hono<HonoEnvironment>();

  app
    .use(requestId({ headerName: REQUEST_ID_HEADER_NAME }))
    .use(compress())
    .use(secureHeaders())
    .use(etag())
    .use(injectRequestContext(overrides))
    .route(HEALTH_ROUTER_NAME, healthRouter())
    .route(PUBLIC_API_BASE_PATH, publicApiRouter())
    .route(APP_API_BASE_PATH, appApiRouter())
    .route(DOCS_ROUTE_NAME, docsRouter(app))
    .route(WEB_ROUTE_NAME, webRouter());

  if (DEBUG) {
    showRoutes(app, { verbose: false });
  }

  return app;
}

const app = createApp();

export default app;
