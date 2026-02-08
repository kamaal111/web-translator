import { defineMessages } from 'react-intl';

const messages = defineMessages({
  publishButton: {
    id: 'PUBLISH_BUTTON.PUBLISH_BUTTON',
    defaultMessage: 'Publish',
    description: 'Button label to publish draft translations',
  },
  publishingButton: {
    id: 'PUBLISH_BUTTON.PUBLISHING_BUTTON',
    defaultMessage: 'Publishing...',
    description: 'Button label shown while publish operation is in progress',
  },
  confirmTitle: {
    id: 'PUBLISH_BUTTON.CONFIRM_TITLE',
    defaultMessage: 'Confirm publish',
    description: 'Title for the publish confirmation dialog',
  },
  confirmMessage: {
    id: 'PUBLISH_BUTTON.CONFIRM_MESSAGE',
    defaultMessage:
      'This will create an immutable snapshot of the current draft translations. Are you sure you want to publish?',
    description: 'Message explaining what publishing does and asking for confirmation',
  },
  confirmButton: {
    id: 'PUBLISH_BUTTON.CONFIRM_BUTTON',
    defaultMessage: 'Confirm',
    description: 'Button label to confirm the publish action',
  },
  cancelButton: {
    id: 'PUBLISH_BUTTON.CANCEL_BUTTON',
    defaultMessage: 'Cancel',
    description: 'Button label to cancel the publish action',
  },
  publishSuccess: {
    id: 'PUBLISH_BUTTON.PUBLISH_SUCCESS',
    defaultMessage: 'Successfully published {count} locale(s)',
    description: 'Success message shown after publishing, includes count of published locales',
  },
  publishError: {
    id: 'PUBLISH_BUTTON.PUBLISH_ERROR',
    defaultMessage: 'Failed to publish translations',
    description: 'Error message shown when publish operation fails',
  },
  noChangesError: {
    id: 'PUBLISH_BUTTON.NO_CHANGES_ERROR',
    defaultMessage: 'No changes detected. Draft translations are identical to the latest snapshot.',
    description: 'Error message shown when there are no changes to publish',
  },
});

export default messages;
