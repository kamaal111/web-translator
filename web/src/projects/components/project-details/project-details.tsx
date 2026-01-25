import { Box, Flex, Heading, Text, Card, Badge } from '@radix-ui/themes';
import { FormattedMessage } from 'react-intl';

import type { ProjectResponse } from '@/generated/api-client/src';
import messages from './messages';

import './project-details.css';

interface ProjectDetailsProps {
  project: ProjectResponse;
}

function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <Box className="project-container" px="6" py="5">
      <Flex direction="column" gap="4">
        <Heading as="h1" size="8">
          {project.name}
        </Heading>

        <Card>
          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" weight="bold" color="gray">
                <FormattedMessage {...messages.defaultLocale} values={{ locale: project.defaultLocale }} />
              </Text>
            </Box>

            <Box>
              <Text size="2" weight="bold" color="gray" mb="2">
                <FormattedMessage {...messages.enabledLocales} />
              </Text>
              <Flex gap="2" wrap="wrap">
                {project.enabledLocales.map(locale => (
                  <Badge key={locale} variant="soft">
                    {locale}
                  </Badge>
                ))}
              </Flex>
            </Box>

            <Box>
              <Text size="2" weight="bold" color="gray" mb="1">
                <FormattedMessage {...messages.publicReadKey} />
              </Text>
              <Text size="2" className="project-details-public-key">
                {project.publicReadKey}
              </Text>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}

export default ProjectDetails;
