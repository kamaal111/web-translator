import type { Next } from 'hono';

import type { HonoContext } from '../../context';
import templateHandler from '../handlers/template';
import type { TemplateFetcher } from '../template-fetcher';

export function serveTemplate(options: { routes: string[]; templateFetcher: TemplateFetcher }) {
  return async (c: HonoContext, next: Next) => {
    if (options.routes.includes(c.req.path) && c.req.method.toUpperCase() === 'GET') {
      return templateHandler({ templateFetcher: options.templateFetcher })(c);
    }

    await next();
  };
}
