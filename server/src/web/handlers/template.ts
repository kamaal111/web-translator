import type { HonoContext } from '../../context';
import { TEMPLATE_NAMES, type TemplateFetcher } from '../template-fetcher';

function templateHandler(options: { templateFetcher: TemplateFetcher }) {
  return async (c: HonoContext) => {
    const templateName = TEMPLATE_NAMES.INDEX;
    const template = await options.templateFetcher.get(templateName);

    return c.html(template.replace('{{ WebTranslatorContext }}', JSON.stringify({})));
  };
}

export default templateHandler;
