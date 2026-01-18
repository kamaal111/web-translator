import { getOptionalUserSession, getSessionLocale } from '../../auth/utils/session';
import type { HonoContext } from '../../context';
import { TEMPLATE_NAMES, type TemplateFetcher } from '../template-fetcher';

function templateHandler(options: { templateFetcher: TemplateFetcher }) {
  return async (c: HonoContext) => {
    const templateName = TEMPLATE_NAMES.INDEX;
    const [template, context] = await Promise.all([options.templateFetcher.get(templateName), makeTemplateContext(c)]);

    return c.html(template.replace('{{ WebTranslatorContext }}', JSON.stringify(context)));
  };
}

async function makeTemplateContext(c: HonoContext) {
  const session = await getOptionalUserSession(c);
  if (session == null) {
    return { locale: getSessionLocale(c), current_user: null };
  }

  return { locale: session.user.locale, current_user: session.user };
}

export default templateHandler;
