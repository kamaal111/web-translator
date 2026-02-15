import { Box, Text, Flex, Button, Dialog, TextArea } from '@radix-ui/themes';
import { FormattedMessage, useIntl, FormattedDate } from 'react-intl';
import type { ConflictErrorResponse } from '@wt/schemas';

import useDraftEditor from '@/projects/hooks/use-draft-editor';
import messages from './messages';

import './draft-editor.css';

interface DraftEditorProps {
  projectId: string;
  stringKey: string;
  locale: string;
  initialValue: string;
  updatedAt: string;
  onSave?: () => void;
  onCancel?: () => void;
}

function DraftEditor({ projectId, stringKey, locale, initialValue, updatedAt, onSave, onCancel }: DraftEditorProps) {
  const intl = useIntl();
  const {
    value,
    setValue,
    handleSave,
    handleForceSave,
    handleCancel,
    isSaving,
    isError,
    conflictError,
    canSave,
    isEmpty,
  } = useDraftEditor({
    projectId,
    stringKey,
    locale,
    initialValue,
    updatedAt,
    onSave,
    onCancel,
  });

  return (
    <Box className="draft-editor">
      <TextArea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={intl.formatMessage(messages.EDIT_DRAFT_LABEL, { locale })}
        aria-label={intl.formatMessage(messages.EDIT_DRAFT_LABEL, { locale })}
        rows={4}
        className="draft-editor-textarea"
      />

      {isEmpty && (
        <Text size="1" color="red" as="p" mt="1">
          <FormattedMessage {...messages.EMPTY_VALUE_ERROR} />
        </Text>
      )}

      {isError && !conflictError && (
        <Text size="1" color="red" as="p" mt="1">
          <FormattedMessage {...messages.SAVE_ERROR} />
        </Text>
      )}

      <Flex gap="2" mt="3">
        <Button
          onClick={handleSave}
          disabled={!canSave}
          aria-label={intl.formatMessage(isSaving ? messages.SAVING_BUTTON : messages.SAVE_BUTTON)}
        >
          <FormattedMessage {...(isSaving ? messages.SAVING_BUTTON : messages.SAVE_BUTTON)} />
        </Button>
        <Button
          variant="soft"
          color="gray"
          onClick={handleCancel}
          disabled={isSaving}
          aria-label={intl.formatMessage(messages.CANCEL_BUTTON)}
        >
          <FormattedMessage {...messages.CANCEL_BUTTON} />
        </Button>
      </Flex>

      <ConflictDialog
        isOpen={Boolean(conflictError)}
        conflictDetails={conflictError?.context.conflictDetails}
        onForceSave={handleForceSave}
        onDismiss={handleCancel}
      />
    </Box>
  );
}

function ConflictDialog({
  isOpen,
  conflictDetails,
  onForceSave,
  onDismiss,
}: {
  isOpen: boolean;
  conflictDetails?: ConflictErrorResponse['context']['conflictDetails'];
  onForceSave: () => void;
  onDismiss: () => void;
}) {
  const intl = useIntl();

  if (!conflictDetails) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>
          <FormattedMessage {...messages.CONFLICT_TITLE} />
        </Dialog.Title>
        <Dialog.Description size="2" mb="4">
          <FormattedMessage
            {...messages.CONFLICT_MESSAGE}
            values={{
              userName: conflictDetails.lastModifiedBy.name,
              time: (
                <FormattedDate
                  value={conflictDetails.lastModifiedAt}
                  year="numeric"
                  month="short"
                  day="numeric"
                  hour="2-digit"
                  minute="2-digit"
                />
              ),
            }}
          />
        </Dialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button
              variant="soft"
              color="gray"
              onClick={onDismiss}
              aria-label={intl.formatMessage(messages.DISMISS_BUTTON)}
            >
              <FormattedMessage {...messages.DISMISS_BUTTON} />
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={onForceSave} color="red" aria-label={intl.formatMessage(messages.FORCE_SAVE_BUTTON)}>
              <FormattedMessage {...messages.FORCE_SAVE_BUTTON} />
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default DraftEditor;
