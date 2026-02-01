import { defineMessages } from 'react-intl';

const messages = defineMessages({
  unexpectedError: {
    id: 'COMMON.UNEXPECTED_ERROR',
    defaultMessage: 'Something went wrong',
    description: 'Unexpected error happened',
  },
  // Version History base messages
  versionHistoryTitle: {
    id: 'COMMON.VERSION_HISTORY.TITLE',
    defaultMessage: 'Version History',
    description: 'Title for version history section',
  },
  versionHistoryLoading: {
    id: 'COMMON.VERSION_HISTORY.LOADING',
    defaultMessage: 'Loading version history...',
    description: 'Loading state for version history',
  },
  versionHistoryError: {
    id: 'COMMON.VERSION_HISTORY.ERROR',
    defaultMessage: 'Failed to load version history',
    description: 'Error message when version history fails to load',
  },
  versionHistoryEmpty: {
    id: 'COMMON.VERSION_HISTORY.EMPTY',
    defaultMessage: 'No version history available',
    description: 'Message when no versions exist',
  },
  versionHistoryDraftLabel: {
    id: 'COMMON.VERSION_HISTORY.DRAFT_LABEL',
    defaultMessage: 'Draft',
    description: 'Label for draft version',
  },
  versionHistoryVersionLabel: {
    id: 'COMMON.VERSION_HISTORY.VERSION_LABEL',
    defaultMessage: 'Version {version}',
    description: 'Label for a specific version number',
  },
  versionHistoryUpdatedBy: {
    id: 'COMMON.VERSION_HISTORY.UPDATED_BY',
    defaultMessage: 'Updated by {name}',
    description: 'Shows who updated a version',
  },
  versionHistoryCreatedBy: {
    id: 'COMMON.VERSION_HISTORY.CREATED_BY',
    defaultMessage: 'Created by {name}',
    description: 'Shows who created a version',
  },
  versionHistoryLoadMore: {
    id: 'COMMON.VERSION_HISTORY.LOAD_MORE',
    defaultMessage: 'Load more versions',
    description: 'Button to load more versions',
  },
});

export default messages;
