import { Box, Text, Flex, Button, Dialog } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';
import toast from 'react-hot-toast';

import usePublish from '@/projects/hooks/use-publish';
import messages from './messages';

import './publish-button.css';

interface PublishButtonProps {
  projectId: string;
}

function PublishButton({ projectId }: PublishButtonProps) {
  const intl = useIntl();
  const { isDialogOpen, openDialog, closeDialog, handlePublish, isPublishing, isError, noChangesError } = usePublish({
    projectId,
    onSuccess: result => {
      toast.success(intl.formatMessage(messages.publishSuccess, { count: result.published.length }));
    },
  });

  return (
    <Box>
      <Button onClick={openDialog} aria-label={intl.formatMessage(messages.publishButton)}>
        <FormattedMessage {...messages.publishButton} />
      </Button>

      <Dialog.Root open={isDialogOpen} onOpenChange={open => !open && closeDialog()}>
        <Dialog.Content maxWidth="450px" className="publish-dialog">
          <Dialog.Title>
            <FormattedMessage {...messages.confirmTitle} />
          </Dialog.Title>
          <Dialog.Description size="2" mb="4">
            <FormattedMessage {...messages.confirmMessage} />
          </Dialog.Description>

          {noChangesError && (
            <Text size="2" color="amber" as="p" mb="3">
              <FormattedMessage {...messages.noChangesError} />
            </Text>
          )}

          {isError && (
            <Text size="2" color="red" as="p" mb="3">
              <FormattedMessage {...messages.publishError} />
            </Text>
          )}

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button
                variant="soft"
                color="gray"
                onClick={closeDialog}
                disabled={isPublishing}
                aria-label={intl.formatMessage(messages.cancelButton)}
              >
                <FormattedMessage {...messages.cancelButton} />
              </Button>
            </Dialog.Close>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              aria-label={intl.formatMessage(isPublishing ? messages.publishingButton : messages.confirmButton)}
            >
              <FormattedMessage {...(isPublishing ? messages.publishingButton : messages.confirmButton)} />
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}

export default PublishButton;
