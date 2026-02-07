import { defineMessages } from 'react-intl';

const messages = defineMessages({
  EDIT_DRAFT_LABEL: {
    id: 'DRAFT_EDITOR.EDIT_DRAFT_LABEL',
    defaultMessage: 'Edit draft translation for {locale}',
  },
  SAVE_BUTTON: {
    id: 'DRAFT_EDITOR.SAVE_BUTTON',
    defaultMessage: 'Save',
  },
  SAVING_BUTTON: {
    id: 'DRAFT_EDITOR.SAVING_BUTTON',
    defaultMessage: 'Saving...',
  },
  CANCEL_BUTTON: {
    id: 'DRAFT_EDITOR.CANCEL_BUTTON',
    defaultMessage: 'Cancel',
  },
  SAVE_ERROR: {
    id: 'DRAFT_EDITOR.SAVE_ERROR',
    defaultMessage: 'Failed to save changes',
  },
  CONFLICT_TITLE: {
    id: 'DRAFT_EDITOR.CONFLICT_TITLE',
    defaultMessage: 'Concurrent modification detected',
  },
  CONFLICT_MESSAGE: {
    id: 'DRAFT_EDITOR.CONFLICT_MESSAGE',
    defaultMessage: 'Another user ({userName}) modified this translation at {time}. Review changes and retry.',
  },
  FORCE_SAVE_BUTTON: {
    id: 'DRAFT_EDITOR.FORCE_SAVE_BUTTON',
    defaultMessage: 'Force save',
  },
  DISMISS_BUTTON: {
    id: 'DRAFT_EDITOR.DISMISS_BUTTON',
    defaultMessage: 'Dismiss',
  },
  EMPTY_VALUE_ERROR: {
    id: 'DRAFT_EDITOR.EMPTY_VALUE_ERROR',
    defaultMessage: 'Translation cannot be empty',
  },
});

export default messages;
