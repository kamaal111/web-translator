import { defineMessages } from 'react-intl';

const messages = defineMessages({
  defaultLocale: {
    id: 'PROJECT.DEFAULT_LOCALE',
    defaultMessage: 'Default Locale: {locale}',
    description: 'Label showing the default locale for the project',
  },
  enabledLocales: {
    id: 'PROJECT.ENABLED_LOCALES',
    defaultMessage: 'Enabled Locales',
    description: 'Section heading for list of enabled locales in the project',
  },
  publicReadKey: {
    id: 'PROJECT.PUBLIC_READ_KEY',
    defaultMessage: 'Public Read Key:',
    description: 'Label for the public read key used to access translations via API',
  },
  showKey: {
    id: 'PROJECT.SHOW_KEY',
    defaultMessage: 'Show key',
    description: 'Aria label for button that reveals the public read key',
  },
  hideKey: {
    id: 'PROJECT.HIDE_KEY',
    defaultMessage: 'Hide key',
    description: 'Aria label for button that hides the public read key',
  },
  copyKey: {
    id: 'PROJECT.COPY_KEY',
    defaultMessage: 'Copy key',
    description: 'Aria label for button that copies the public read key to clipboard',
  },
  keyCopied: {
    id: 'PROJECT.KEY_COPIED',
    defaultMessage: 'Key copied to clipboard',
    description: 'Success toast message shown after copying public read key to clipboard',
  },
  createString: {
    id: 'PROJECT.CREATE_STRING',
    defaultMessage: 'Create String',
    description: 'Button text and aria label for opening the create string dialog',
  },
});

export default messages;
