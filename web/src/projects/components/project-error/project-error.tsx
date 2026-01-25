import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import messages from './messages';

import './project-error.css';

interface ProjectErrorProps {
  is4xxError: boolean;
}

function ProjectError({ is4xxError }: ProjectErrorProps) {
  const navigate = useNavigate();

  return (
    <Box className="project-container" px="6" py="5">
      <Flex direction="column" gap="4" align="center" justify="center" className="project-error-container">
        <Text color="red" size="6" weight="bold">
          <FormattedMessage {...(is4xxError ? messages.notFound : messages.error)} />
        </Text>
        {is4xxError && (
          <Button onClick={() => navigate('/')}>
            <FormattedMessage {...messages.goToHome} />
          </Button>
        )}
      </Flex>
    </Box>
  );
}

export default ProjectError;
