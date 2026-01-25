import { defineMessages } from 'react-intl';

const messages = defineMessages({
  defaultLocale: {
    id: 'PROJECT.DEFAULT_LOCALE',
    defaultMessage: 'Default Locale: {locale}',
  },
  enabledLocales: {
    id: 'PROJECT.ENABLED_LOCALES',
    defaultMessage: 'Enabled Locales',
  },
  publicReadKey: {
    id: 'PROJECT.PUBLIC_READ_KEY',
    defaultMessage: 'Public Read Key:',
  },
  showKey: {
    id: 'PROJECT.SHOW_KEY',
    defaultMessage: 'Show key',
  },
  hideKey: {
    id: 'PROJECT.HIDE_KEY',
    defaultMessage: 'Hide key',
  },
  copyKey: {
    id: 'PROJECT.COPY_KEY',
    defaultMessage: 'Copy key',
  },
  keyCopied: {
    id: 'PROJECT.KEY_COPIED',
    defaultMessage: 'Key copied to clipboard',
  },
});

export default messages;
