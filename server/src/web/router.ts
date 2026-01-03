import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

import type { HonoEnvironment } from '../context';
import env from '../env';
import LocalTemplateFetcher from './template-fetcher/local-template-fetcher';
import { TEMPLATE_NAMES } from './template-fetcher/constants';

const { WEB_ASSETS_ROOT } = env;

const webRouter = new Hono<HonoEnvironment>();

const templateFetcher = new LocalTemplateFetcher(WEB_ASSETS_ROOT);

webRouter
  .get('/', async c => {
    const template = await templateFetcher.get(TEMPLATE_NAMES.INDEX);
    return c.html(template);
  })
  .use('/*', serveStatic({ root: WEB_ASSETS_ROOT }));

export default webRouter;
