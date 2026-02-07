import { defineMessages } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'STRING_VERSION_HISTORY.TITLE',
    defaultMessage: 'Version History',
  },
  loading: {
    id: 'STRING_VERSION_HISTORY.LOADING',
    defaultMessage: 'Loading version history...',
  },
  errorLoading: {
    id: 'STRING_VERSION_HISTORY.ERROR_LOADING',
    defaultMessage: 'Failed to load version history',
  },
  noVersions: {
    id: 'STRING_VERSION_HISTORY.NO_VERSIONS',
    defaultMessage: 'No versions found',
  },
  noVersionsForLocale: {
    id: 'STRING_VERSION_HISTORY.NO_VERSIONS_FOR_LOCALE',
    defaultMessage: 'No published versions for this locale yet',
  },
  localeHeader: {
    id: 'STRING_VERSION_HISTORY.LOCALE_HEADER',
    defaultMessage: '{locale}',
  },
  draftLabel: {
    id: 'STRING_VERSION_HISTORY.DRAFT_LABEL',
    defaultMessage: 'Draft',
  },
  versionLabel: {
    id: 'STRING_VERSION_HISTORY.VERSION_LABEL',
    defaultMessage: 'v{version}',
  },
  publishedLabel: {
    id: 'STRING_VERSION_HISTORY.PUBLISHED_LABEL',
    defaultMessage: 'Published',
  },
  createdAt: {
    id: 'STRING_VERSION_HISTORY.CREATED_AT',
    defaultMessage: 'Created {date}',
  },
  updatedAt: {
    id: 'STRING_VERSION_HISTORY.UPDATED_AT',
    defaultMessage: 'Updated {date}',
  },
  by: {
    id: 'STRING_VERSION_HISTORY.BY',
    defaultMessage: 'by {name}',
  },
  noDraft: {
    id: 'STRING_VERSION_HISTORY.NO_DRAFT',
    defaultMessage: 'No draft translation',
  },
  expandLocale: {
    id: 'STRING_VERSION_HISTORY.EXPAND_LOCALE',
    defaultMessage: 'Show version history for {locale}',
  },
  collapseLocale: {
    id: 'STRING_VERSION_HISTORY.COLLAPSE_LOCALE',
    defaultMessage: 'Hide version history for {locale}',
  },
  loadMore: {
    id: 'STRING_VERSION_HISTORY.LOAD_MORE',
    defaultMessage: 'Load more versions',
  },
  edit: {
    id: 'STRING_VERSION_HISTORY.EDIT',
    defaultMessage: 'Edit',
  },
  editDraft: {
    id: 'STRING_VERSION_HISTORY.EDIT_DRAFT',
    defaultMessage: 'Edit draft translation',
  },
});

export default messages;
