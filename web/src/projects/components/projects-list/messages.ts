import { defineMessages } from 'react-intl';

const messages = defineMessages({
  loadingProjects: {
    id: 'PROJECTS.PROJECTS_LIST.LOADING_PROJECTS',
    defaultMessage: 'Loading projects',
    description: 'Aria label for loading spinner',
  },
  errorFetchingProjects: {
    id: 'PROJECTS.PROJECTS_LIST.ERROR_FETCHING_PROJECTS',
    defaultMessage: 'Could not fetch projects. Please try again later.',
    description: 'Error message shown when projects cannot be loaded',
  },
  noProjects: {
    id: 'PROJECTS.PROJECTS_LIST.NO_PROJECTS',
    defaultMessage: "You don't have any projects yet.",
    description: 'Message shown when user has no projects',
  },
});

export default messages;
