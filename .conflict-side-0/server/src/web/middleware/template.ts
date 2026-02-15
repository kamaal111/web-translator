import type { Next } from 'hono';

import type { HonoContext } from '../../context';
import templateHandler from '../handlers/template';
import type { TemplateFetcher } from '../template-fetcher';
import type { HtmlRoute, HtmlRoutes } from '../types';

export function serveTemplate(options: { routes: HtmlRoutes; templateFetcher: TemplateFetcher }) {
  return async (c: HonoContext, next: Next) => {
    if (c.req.method.toUpperCase() !== 'GET') {
      await next();
      return;
    }

    const matchedRoute = options.routes.find(route => matchesRoute(c.req.path, route));
    if (matchedRoute == null) {
      await next();
      return;
    }

    return templateHandler({
      templateFetcher: options.templateFetcher,
      loginIsRequired: matchedRoute.loginIsRequired,
    })(c);
  };
}

function matchesRoute(path: string, route: HtmlRoute): boolean {
  if (path === route.pattern) {
    return true;
  }

  if (!route.pattern.includes(':')) {
    return false;
  }

  const patternParts = route.pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, index) => part.startsWith(':') || part === pathParts[index]);
}
