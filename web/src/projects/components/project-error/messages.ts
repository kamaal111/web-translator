import { defineMessages } from 'react-intl';

const messages = defineMessages({
  notFound: {
    id: 'PROJECT.NOT_FOUND',
    defaultMessage: 'Project does not exist',
    description: 'Error message shown when user tries to access a non-existent project (404)',
  },
  error: {
    id: 'PROJECT.ERROR',
    defaultMessage: 'Failed to load project',
    description: 'Error message shown when project fails to load due to server error (5xx)',
  },
  goToHome: {
    id: 'PROJECT.GO_TO_HOME',
    defaultMessage: 'Go to Home',
    description: 'Button text to navigate back to home page from project error screen',
  },
});

export default messages;
