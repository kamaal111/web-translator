import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

import PublishButton from '@/projects/components/publish-button/publish-button';
import messages from './messages';

interface BulkEditorHeaderProps {
  projectId: string;
  projectName: string;
  isDirty: boolean;
  dirtyCount: number;
  isSaving: boolean;
  onSave: () => void;
}

function BulkEditorHeader({ projectId, projectName, isDirty, dirtyCount, isSaving, onSave }: BulkEditorHeaderProps) {
  const intl = useIntl();

  return (
    <Box pb="4">
      <Flex direction="column" gap="2">
        <Link to={`/projects/${projectId}`} aria-label={intl.formatMessage(messages.backToProject)}>
          <Flex align="center" gap="1">
            <ArrowLeftIcon />
            <Text size="2" color="gray">
              {projectName}
            </Text>
          </Flex>
        </Link>

        <Flex justify="between" align="center">
          <Heading as="h1" size="6">
            <FormattedMessage {...messages.pageTitle} />
          </Heading>

          <Flex gap="2" align="center">
            {isDirty && (
              <Text size="2" color="amber">
                <FormattedMessage {...messages.unsavedChangesCount} values={{ count: dirtyCount }} />
              </Text>
            )}

            <Button
              onClick={onSave}
              disabled={!isDirty || isSaving}
              aria-label={intl.formatMessage(isSaving ? messages.savingButton : messages.saveButton)}
            >
              <FormattedMessage {...(isSaving ? messages.savingButton : messages.saveButton)} />
            </Button>

            <PublishButton projectId={projectId} />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

export default BulkEditorHeader;
