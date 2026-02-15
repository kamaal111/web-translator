import { defineMessages } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'STRING_VERSION_HISTORY.TITLE',
    defaultMessage: 'Version History',
    description: 'Heading for the version history section showing all versions of a string',
  },
  loading: {
    id: 'STRING_VERSION_HISTORY.LOADING',
    defaultMessage: 'Loading version history...',
    description: 'Loading state message shown while version history is being fetched',
  },
  errorLoading: {
    id: 'STRING_VERSION_HISTORY.ERROR_LOADING',
    defaultMessage: 'Failed to load version history',
    description: 'Error message shown when version history fails to load from the server',
  },
  noVersions: {
    id: 'STRING_VERSION_HISTORY.NO_VERSIONS',
    defaultMessage: 'No versions found',
    description: 'Empty state message shown when string has no published versions yet',
  },
  noVersionsForLocale: {
    id: 'STRING_VERSION_HISTORY.NO_VERSIONS_FOR_LOCALE',
    defaultMessage: 'No published versions for this locale yet',
    description: 'Empty state message shown when specific locale has no published versions',
  },
  localeHeader: {
    id: 'STRING_VERSION_HISTORY.LOCALE_HEADER',
    defaultMessage: '{locale}',
    description: 'Accordion trigger label showing the locale name in version history',
  },
  draftLabel: {
    id: 'STRING_VERSION_HISTORY.DRAFT_LABEL',
    defaultMessage: 'Draft',
    description: 'Badge label identifying the current draft version of a translation',
  },
  versionLabel: {
    id: 'STRING_VERSION_HISTORY.VERSION_LABEL',
    defaultMessage: 'v{version}',
    description: 'Badge label showing the version number (e.g., v1, v2) and aria label for version item',
  },
  publishedLabel: {
    id: 'STRING_VERSION_HISTORY.PUBLISHED_LABEL',
    defaultMessage: 'Published',
    description: 'Badge label indicating a version has been published',
  },
  createdAt: {
    id: 'STRING_VERSION_HISTORY.CREATED_AT',
    defaultMessage: 'Created {date}',
    description: 'Text showing when a version was created (date is formatted)',
  },
  updatedAt: {
    id: 'STRING_VERSION_HISTORY.UPDATED_AT',
    defaultMessage: 'Updated {date}',
    description: 'Text showing when a draft was last updated (date is formatted)',
  },
  by: {
    id: 'STRING_VERSION_HISTORY.BY',
    defaultMessage: 'by {name}',
    description: 'Text showing who created or updated a version (follows Created/Updated message)',
  },
  noDraft: {
    id: 'STRING_VERSION_HISTORY.NO_DRAFT',
    defaultMessage: 'No draft translation',
    description: 'Message shown when locale has no draft translation yet',
  },
  expandLocale: {
    id: 'STRING_VERSION_HISTORY.EXPAND_LOCALE',
    defaultMessage: 'Show version history for {locale}',
    description: 'Aria label for accordion trigger to expand and show versions for a locale',
  },
  edit: {
    id: 'STRING_VERSION_HISTORY.EDIT',
    defaultMessage: 'Edit',
    description: 'Button text to enter edit mode for draft translation',
  },
  editDraft: {
    id: 'STRING_VERSION_HISTORY.EDIT_DRAFT',
    defaultMessage: 'Edit draft translation',
    description: 'Aria label for button to enter edit mode for draft translation',
  },
  compare: {
    id: 'STRING_VERSION_HISTORY.COMPARE',
    defaultMessage: 'Compare',
    description: 'Button text to open the version comparison view',
  },
  compareVersions: {
    id: 'STRING_VERSION_HISTORY.COMPARE_VERSIONS',
    defaultMessage: 'Compare versions',
    description: 'Aria label for the button that opens the version comparison view',
  },
  closeComparison: {
    id: 'STRING_VERSION_HISTORY.CLOSE_COMPARISON',
    defaultMessage: 'Close comparison',
    description: 'Aria label for the button to close the version comparison view',
  },
  close: {
    id: 'STRING_VERSION_HISTORY.CLOSE',
    defaultMessage: 'Close',
    description: 'Button text to close the version comparison view',
  },
  diffLabel: {
    id: 'STRING_VERSION_HISTORY.DIFF_LABEL',
    defaultMessage: 'Changes',
    description: 'Heading label for the diff section showing changes between versions',
  },
});

export default messages;
