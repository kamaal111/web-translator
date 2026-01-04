import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

import type { HonoEnvironment } from '../context';
import env from '../env';
import { serveTemplate } from './middleware/template';
import { LocalTemplateFetcher, type TemplateFetcher } from './template-fetcher';

const { WEB_ASSETS_ROOT } = env;

const webRouter = new Hono<HonoEnvironment>();
const templateFetcher: TemplateFetcher = new LocalTemplateFetcher(WEB_ASSETS_ROOT);

const WEB_ROUTES = ['/', '/login'];

webRouter.use('*', serveTemplate({ routes: WEB_ROUTES, templateFetcher }), serveStatic({ root: WEB_ASSETS_ROOT }));

export default webRouter;
