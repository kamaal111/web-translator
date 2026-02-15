import { defineMessages } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'STRINGS_LIST.TITLE',
    defaultMessage: 'Strings',
    description: 'Heading for the list of translation strings in a project',
  },
  loading: {
    id: 'STRINGS_LIST.LOADING',
    defaultMessage: 'Loading strings...',
    description: 'Loading state message shown while strings are being fetched',
  },
  errorLoading: {
    id: 'STRINGS_LIST.ERROR_LOADING',
    defaultMessage: 'Failed to load strings',
    description: 'Error message shown when strings fail to load from the server',
  },
  noStrings: {
    id: 'STRINGS_LIST.NO_STRINGS',
    defaultMessage: 'No strings found. Create your first string to get started.',
    description: 'Empty state message shown when project has no translation strings yet',
  },
  expandString: {
    id: 'STRINGS_LIST.EXPAND_STRING',
    defaultMessage: 'Expand string {key}',
    description: 'Aria label for accordion trigger to expand and show version history for a string',
  },
  noTranslations: {
    id: 'STRINGS_LIST.NO_TRANSLATIONS',
    defaultMessage: 'No translations yet',
    description: 'Message shown when a string has no translations in any locale',
  },
  showVersionHistory: {
    id: 'STRINGS_LIST.SHOW_VERSION_HISTORY',
    defaultMessage: 'Show Version History',
    description: 'Button label to load and display full version history and editing interface',
  },
});

export default messages;
