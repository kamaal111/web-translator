import { Box, Text } from '@radix-ui/themes';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

interface BulkEditorPageProps {
  projectId: string;
}

export function BulkEditorPage({ projectId }: BulkEditorPageProps) {
  return (
    <Box p="4">
      <Text size="5" weight="bold">
        <FormattedMessage {...messages.pageTitle} />
      </Text>
      <Text size="2" color="gray">
        <FormattedMessage {...messages.projectIdLabel} values={{ projectId }} />
      </Text>
    </Box>
  );
}
