import { Hono } from 'hono';
import { openAPIRouteHandler } from 'hono-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { swaggerUI } from '@hono/swagger-ui';

import type { HonoEnvironment } from '../context';
import { SPEC_NAME, SPEC_SOURCE_OF_TRUTH_URL } from './constants';
import yamlSpecHandler from './handlers/yaml-spec';

const OPENAPI_INFO = {
  info: { title: 'Web Translator API', version: '1.0.0' },
  servers: [{ url: 'http://127.0.0.1:3000' }],
};

const router = new Hono<HonoEnvironment>();

function docsRouter(app: Hono<HonoEnvironment>) {
  return router
    .get(SPEC_SOURCE_OF_TRUTH_URL, openAPIRouteHandler(app, { documentation: OPENAPI_INFO }))
    .get('/scalar', Scalar({ url: SPEC_SOURCE_OF_TRUTH_URL }))
    .get('/doc', swaggerUI({ url: SPEC_SOURCE_OF_TRUTH_URL }))
    .get(`${SPEC_NAME}.yaml`, yamlSpecHandler(app));
}

export default docsRouter;
