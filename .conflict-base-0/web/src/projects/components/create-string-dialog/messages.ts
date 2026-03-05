import { defineMessages } from 'react-intl';

const messages = defineMessages({
  dialogTitle: {
    id: 'CREATE_STRING_DIALOG.DIALOG_TITLE',
    defaultMessage: 'Create New String',
    description: 'Title of dialog for creating a new translation string',
  },
  dialogDescription: {
    id: 'CREATE_STRING_DIALOG.DIALOG_DESCRIPTION',
    defaultMessage: 'Add a new translation string to your project.',
    description: 'Description text explaining the purpose of the create string dialog',
  },
  keyLabel: {
    id: 'CREATE_STRING_DIALOG.KEY_LABEL',
    defaultMessage: 'String Key',
    description: 'Form label for the string key input field',
  },
  keyPlaceholder: {
    id: 'CREATE_STRING_DIALOG.KEY_PLACEHOLDER',
    defaultMessage: 'e.g., HOME.TITLE',
    description: 'Placeholder text showing example key format in key input field',
  },
  contextLabel: {
    id: 'CREATE_STRING_DIALOG.CONTEXT_LABEL',
    defaultMessage: 'Context (optional)',
    description: 'Form label for the optional context input field',
  },
  contextPlaceholder: {
    id: 'CREATE_STRING_DIALOG.CONTEXT_PLACEHOLDER',
    defaultMessage: 'Describe where this string is used',
    description: 'Placeholder text explaining what to enter in context field',
  },
  translationLabel: {
    id: 'CREATE_STRING_DIALOG.TRANSLATION_LABEL',
    defaultMessage: 'Translation ({locale})',
    description: 'Form label for translation input field, includes the locale being translated',
  },
  translationPlaceholder: {
    id: 'CREATE_STRING_DIALOG.TRANSLATION_PLACEHOLDER',
    defaultMessage: 'Enter translation value',
    description: 'Placeholder text prompting user to enter translation in the form',
  },
  cancel: {
    id: 'CREATE_STRING_DIALOG.CANCEL',
    defaultMessage: 'Cancel',
    description: 'Button text to close dialog without creating string',
  },
  success: {
    id: 'CREATE_STRING_DIALOG.SUCCESS',
    defaultMessage: 'String created successfully',
    description: 'Success toast message shown after string is created',
  },
  keyRequired: {
    id: 'CREATE_STRING_DIALOG.KEY_REQUIRED',
    defaultMessage: 'String key is required',
    description: 'Validation error message shown when key field is empty',
  },
  translationRequired: {
    id: 'CREATE_STRING_DIALOG.TRANSLATION_REQUIRED',
    defaultMessage: 'At least one translation is required',
    description: 'Validation error message shown when translation field is empty',
  },
});

export default messages;
