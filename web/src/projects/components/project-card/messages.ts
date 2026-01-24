import { defineMessages } from 'react-intl';

const messages = defineMessages({
  projectCardDefaultLocale: {
    id: 'PROJECTS.PROJECT_CARD.DEFAULT_LOCALE',
    defaultMessage: 'Default: {locale}',
    description: 'Default locale label in project card',
  },
  projectCardLocalesCount: {
    id: 'PROJECTS.PROJECT_CARD.LOCALES_COUNT',
    defaultMessage: '{count, plural, one {# locale} other {# locales}}',
    description: 'Number of locales in project card',
  },
});

export default messages;
