import { defineMessages } from 'react-intl';

const messages = defineMessages({
  pageTitle: {
    id: 'BULK_EDITOR.PAGE_TITLE',
    defaultMessage: 'Bulk Editor',
    description: 'Title displayed at the top of the bulk translation editor page',
  },
  projectIdLabel: {
    id: 'BULK_EDITOR.PROJECT_ID_LABEL',
    defaultMessage: 'Project ID: {projectId}',
    description: 'Label showing the current project ID in the editor',
  },
  loadingStrings: {
    id: 'BULK_EDITOR.LOADING_STRINGS',
    defaultMessage: 'Loading strings...',
    description: 'Message shown while fetching project strings from the server',
  },
  loadingError: {
    id: 'BULK_EDITOR.LOADING_ERROR',
    defaultMessage: 'Failed to load project strings',
    description: 'Error message shown when string loading fails',
  },
  saveButton: {
    id: 'BULK_EDITOR.SAVE_BUTTON',
    defaultMessage: 'Save All Changes',
    description: 'Label for the button that saves all modified translations',
  },
  savingButton: {
    id: 'BULK_EDITOR.SAVING_BUTTON',
    defaultMessage: 'Saving...',
    description: 'Label shown on save button while save operation is in progress',
  },
  saveSuccess: {
    id: 'BULK_EDITOR.SAVE_SUCCESS',
    defaultMessage: 'Changes saved successfully',
    description: 'Success notification shown after translations are saved',
  },
  saveError: {
    id: 'BULK_EDITOR.SAVE_ERROR',
    defaultMessage: 'Failed to save changes',
    description: 'Error notification shown when save operation fails',
  },
  unsavedChangesTitle: {
    id: 'BULK_EDITOR.UNSAVED_CHANGES_TITLE',
    defaultMessage: 'Unsaved Changes',
    description: 'Title of the dialog warning about unsaved changes',
  },
  unsavedChangesMessage: {
    id: 'BULK_EDITOR.UNSAVED_CHANGES_MESSAGE',
    defaultMessage: 'You have unsaved changes. Are you sure you want to leave?',
    description: 'Warning message in dialog when user tries to navigate away with unsaved changes',
  },
  unsavedChangesCount: {
    id: 'BULK_EDITOR.UNSAVED_CHANGES_COUNT',
    defaultMessage: '{count, plural, one {# unsaved change} other {# unsaved changes}}',
    description: 'Counter showing number of unsaved changes in the editor',
  },
  publishButton: {
    id: 'BULK_EDITOR.PUBLISH_BUTTON',
    defaultMessage: 'Publish',
    description: 'Label for button that publishes translations to create a snapshot',
  },
  columnKey: {
    id: 'BULK_EDITOR.COLUMN_KEY',
    defaultMessage: 'Key',
    description: 'Header label for the string key column',
  },
  columnContext: {
    id: 'BULK_EDITOR.COLUMN_CONTEXT',
    defaultMessage: 'Context',
    description: 'Header label for the context column',
  },
  emptyTableMessage: {
    id: 'BULK_EDITOR.EMPTY_TABLE_MESSAGE',
    defaultMessage: 'No strings found',
    description: 'Message shown when there are no strings to display in the table',
  },
  searchPlaceholder: {
    id: 'BULK_EDITOR.SEARCH_PLACEHOLDER',
    defaultMessage: 'Search by key or translation...',
    description: 'Placeholder text in the search input field',
  },
  columnVisibilityTitle: {
    id: 'BULK_EDITOR.COLUMN_VISIBILITY_TITLE',
    defaultMessage: 'Show/Hide Columns',
    description: 'Title for the column visibility menu',
  },
  progressLabel: {
    id: 'BULK_EDITOR.PROGRESS_LABEL',
    defaultMessage: 'Translation Progress',
    description: 'Label for the translation completion progress indicator',
  },
  progressComplete: {
    id: 'BULK_EDITOR.PROGRESS_COMPLETE',
    defaultMessage: '{completed} of {total} ({percentage}%) translations complete for {locale}',
    description: 'Detailed progress message showing completed and total translations for a locale',
  },
  discardButton: {
    id: 'BULK_EDITOR.DISCARD_BUTTON',
    defaultMessage: 'Discard',
    description: 'Label for the button that discards unsaved changes in the navigation warning dialog',
  },
  stayButton: {
    id: 'BULK_EDITOR.STAY_BUTTON',
    defaultMessage: 'Stay',
    description: 'Label for the button that keeps the user on the page in the navigation warning dialog',
  },
  backToProject: {
    id: 'BULK_EDITOR.BACK_TO_PROJECT',
    defaultMessage: 'Back to Project',
    description: 'Aria label for the back navigation link to the project details page',
  },
});

export default messages;
