import { defineMessages } from 'react-intl';

const messages = defineMessages({
  createProjectButton: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT_BUTTON',
    defaultMessage: 'Create Project',
    description: 'Button to open create project dialog',
  },
  createProjectDialogTitle: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT_DIALOG.TITLE',
    defaultMessage: 'Create New Project',
    description: 'Title of create project dialog',
  },
  createProjectDialogDescription: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT_DIALOG.DESCRIPTION',
    defaultMessage: 'Fill in the details to create a new translation project.',
    description: 'Description of create project dialog',
  },
  createProjectDialogCancel: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT_DIALOG.CANCEL',
    defaultMessage: 'Cancel',
    description: 'Cancel button in create project dialog',
  },
  projectNamePlaceholder: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.NAME_PLACEHOLDER',
    defaultMessage: 'My Project',
    description: 'Placeholder for project name field',
  },
  projectNameLabel: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.NAME_LABEL',
    defaultMessage: 'Project Name',
    description: 'Label for project name field',
  },
  defaultLocalePlaceholder: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.DEFAULT_LOCALE_PLACEHOLDER',
    defaultMessage: 'en-US',
    description: 'Placeholder for default locale field',
  },
  defaultLocaleLabel: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.DEFAULT_LOCALE_LABEL',
    defaultMessage: 'Default Locale',
    description: 'Label for default locale field',
  },
  enabledLocalesPlaceholder: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.ENABLED_LOCALES_PLACEHOLDER',
    defaultMessage: 'en-US, es-ES, fr-FR',
    description: 'Placeholder for enabled locales field',
  },
  enabledLocalesLabel: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.ENABLED_LOCALES_LABEL',
    defaultMessage: 'Enabled Locales (comma-separated)',
    description: 'Label for enabled locales field',
  },
  publicReadKeyPlaceholder: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.PUBLIC_READ_KEY_PLACEHOLDER',
    defaultMessage: 'public-key-123',
    description: 'Placeholder for public read key field',
  },
  publicReadKeyLabel: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.PUBLIC_READ_KEY_LABEL',
    defaultMessage: 'Public Read Key',
    description: 'Label for public read key field',
  },
  generateKeyButton: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.GENERATE_KEY_BUTTON',
    defaultMessage: 'Generate',
    description: 'Button to generate a random public read key',
  },
  generateKeyButtonAriaLabel: {
    id: 'PROJECTS.CREATE_PROJECT_DIALOG.CREATE_PROJECT.GENERATE_KEY_BUTTON_ARIA_LABEL',
    defaultMessage: 'Generate random public read key',
    description: 'Aria label for generate key button',
  },
});

export default messages;
