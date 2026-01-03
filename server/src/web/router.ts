import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

import type { HonoEnvironment } from '../context';
import env from '../env';
import { LocalTemplateFetcher, TEMPLATE_NAMES, type TemplateFetcher } from './template-fetcher';

const { WEB_ASSETS_ROOT } = env;

const webRouter = new Hono<HonoEnvironment>();

const templateFetcher: TemplateFetcher = new LocalTemplateFetcher(WEB_ASSETS_ROOT);

webRouter.use('*', serveStatic({ root: WEB_ASSETS_ROOT })).get('*', async c => {
  const templateName = TEMPLATE_NAMES.INDEX;
  const template = await templateFetcher.get(templateName);
  return c.html(template);
});

export default webRouter;
