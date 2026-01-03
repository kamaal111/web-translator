import assert from 'node:assert';
import path from 'node:path';

import BaseTemplateFetcher from './base-template-fetcher';
import { TEMPLATE_NAMES_MAPPED_TO_TEMPLATE, type TemplateName } from './constants';
import type { TemplateFetcher } from './types';
import env from '../../env';

const { DEBUG } = env;

class LocalTemplateFetcher extends BaseTemplateFetcher implements TemplateFetcher {
  readonly rootPath: string;

  private cachedTemplates: Partial<Record<TemplateName, string>> = {};

  constructor(rootPath: string) {
    super();

    this.rootPath = rootPath;
  }

  override async get(name: TemplateName): Promise<string> {
    const cachedTemplate = this.cachedTemplates[name];
    if (cachedTemplate != null) return cachedTemplate;

    const template = TEMPLATE_NAMES_MAPPED_TO_TEMPLATE[name];
    assert(template != null, `Expect template with name ${name} not to be known`);

    const templatePath = path.join(this.rootPath, template);
    const templateFile = Bun.file(templatePath);
    assert(await templateFile.exists());

    const templateText = await templateFile.text();
    if (!DEBUG) {
      this.cachedTemplates[name] = templateText;
    }

    return templateText;
  }
}

export default LocalTemplateFetcher;
