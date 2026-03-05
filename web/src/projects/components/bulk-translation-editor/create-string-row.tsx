import React from 'react';
import { Button, Flex, Table, TextField, Text } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';

import type { NewStringData } from '@/projects/hooks/use-bulk-editor';
import messages from './messages';

interface CreateStringRowProps {
  locales: string[];
  newStringData: NewStringData;
  validationError: string;
  isCreatingString: boolean;
  onKeyChange: (key: string) => void;
  onTranslationChange: (locale: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function CreateStringRow({
  locales,
  newStringData,
  validationError,
  isCreatingString,
  onKeyChange,
  onTranslationChange,
  onSave,
  onCancel,
}: CreateStringRowProps) {
  const intl = useIntl();
  const keyInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    keyInputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave();
    }
  };

  const getErrorMessage = (errorKey: string): string => {
    const messageKey = errorKey as keyof typeof messages;
    if (messages[messageKey]) {
      return intl.formatMessage(messages[messageKey]);
    }
    return errorKey;
  };

  return (
    <Table.Row>
      <Table.Cell>
        <Flex direction="column" gap="1">
          <TextField.Root
            ref={keyInputRef}
            value={newStringData.key}
            onChange={e => onKeyChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={intl.formatMessage(messages.enterStringKeyPlaceholder)}
            disabled={isCreatingString}
            aria-label={intl.formatMessage(messages.enterStringKeyPlaceholder)}
          />
          {validationError && (
            <Text size="1" color="red">
              {getErrorMessage(validationError)}
            </Text>
          )}
        </Flex>
      </Table.Cell>

      {locales.map(locale => (
        <Table.Cell key={locale}>
          <TextField.Root
            value={newStringData.translations[locale] ?? ''}
            onChange={e => onTranslationChange(locale, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={intl.formatMessage(messages.translationForLocalePlaceholder, { locale })}
            disabled={isCreatingString}
            aria-label={intl.formatMessage(messages.translationForLocalePlaceholder, { locale })}
          />
        </Table.Cell>
      ))}

      <Table.Cell>
        <Flex gap="2">
          <Button
            size="2"
            onClick={onSave}
            disabled={isCreatingString || !!validationError}
            aria-label={intl.formatMessage(messages.saveStringButton)}
          >
            <CheckIcon />
            <FormattedMessage {...messages.saveStringButton} />
          </Button>
          <Button
            size="2"
            variant="soft"
            color="gray"
            onClick={onCancel}
            disabled={isCreatingString}
            aria-label={intl.formatMessage(messages.cancelCreationButton)}
          >
            <Cross2Icon />
            <FormattedMessage {...messages.cancelCreationButton} />
          </Button>
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}

export default CreateStringRow;
