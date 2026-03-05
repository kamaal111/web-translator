import { objectKeys } from '../../utils/objects';

export type TemplateName = keyof typeof TEMPLATE_NAMES_MAPPED_TO_TEMPLATE;
export const TEMPLATE_NAMES_MAPPED_TO_TEMPLATE = { INDEX: 'index.html' } as const;
export const TEMPLATE_NAMES = objectKeys(TEMPLATE_NAMES_MAPPED_TO_TEMPLATE);
