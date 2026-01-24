import { defineMessages } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'HOME.TITLE',
    defaultMessage: 'Your projects',
    description: 'Home page title',
  },
  noProjects: {
    id: 'HOME.NO_PROJECTS',
    defaultMessage: "You don't have any projects yet.",
    description: 'Message shown when user has no projects',
  },
  errorFetchingProjects: {
    id: 'HOME.ERROR_FETCHING_PROJECTS',
    defaultMessage: 'Could not fetch projects. Please try again later.',
    description: 'Error message shown when projects cannot be loaded',
  },
  loadingProjects: {
    id: 'HOME.LOADING_PROJECTS',
    defaultMessage: 'Loading projects',
    description: 'Aria label for loading spinner',
  },
  projectCardDefaultLocale: {
    id: 'HOME.PROJECT_CARD.DEFAULT_LOCALE',
    defaultMessage: 'Default: {locale}',
    description: 'Default locale label in project card',
  },
  projectCardLocalesCount: {
    id: 'HOME.PROJECT_CARD.LOCALES_COUNT',
    defaultMessage: '{count, plural, one {# locale} other {# locales}}',
    description: 'Number of locales in project card',
  },
});

export default messages;
