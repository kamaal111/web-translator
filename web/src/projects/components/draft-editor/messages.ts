import { defineMessages } from 'react-intl';

const messages = defineMessages({
  EDIT_DRAFT_LABEL: {
    id: 'DRAFT_EDITOR.EDIT_DRAFT_LABEL',
    defaultMessage: 'Edit draft translation for {locale}',
    description: 'Placeholder and aria label for textarea where users edit draft translations',
  },
  SAVE_BUTTON: {
    id: 'DRAFT_EDITOR.SAVE_BUTTON',
    defaultMessage: 'Save',
    description: 'Button text and aria label to save draft translation changes',
  },
  SAVING_BUTTON: {
    id: 'DRAFT_EDITOR.SAVING_BUTTON',
    defaultMessage: 'Saving...',
    description: 'Button text and aria label shown while save operation is in progress',
  },
  CANCEL_BUTTON: {
    id: 'DRAFT_EDITOR.CANCEL_BUTTON',
    defaultMessage: 'Cancel',
    description: 'Button text and aria label to cancel editing and discard changes',
  },
  SAVE_ERROR: {
    id: 'DRAFT_EDITOR.SAVE_ERROR',
    defaultMessage: 'Failed to save changes',
    description: 'Error message shown when saving draft translation fails',
  },
  CONFLICT_TITLE: {
    id: 'DRAFT_EDITOR.CONFLICT_TITLE',
    defaultMessage: 'Concurrent modification detected',
    description: 'Dialog title shown when another user modified the same translation',
  },
  CONFLICT_MESSAGE: {
    id: 'DRAFT_EDITOR.CONFLICT_MESSAGE',
    defaultMessage: 'Another user ({userName}) modified this translation at {time}. Review changes and retry.',
    description: 'Dialog message explaining who modified the translation and when, asking user to review',
  },
  FORCE_SAVE_BUTTON: {
    id: 'DRAFT_EDITOR.FORCE_SAVE_BUTTON',
    defaultMessage: 'Force save',
    description: 'Button text and aria label to override conflict and force save changes',
  },
  DISMISS_BUTTON: {
    id: 'DRAFT_EDITOR.DISMISS_BUTTON',
    defaultMessage: 'Dismiss',
    description: 'Button text and aria label to dismiss conflict dialog and cancel save',
  },
  EMPTY_VALUE_ERROR: {
    id: 'DRAFT_EDITOR.EMPTY_VALUE_ERROR',
    defaultMessage: 'Translation cannot be empty',
    description: 'Validation error shown when user tries to save an empty translation',
  },
});

export default messages;
