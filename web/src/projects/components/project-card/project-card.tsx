import { Card, Flex, Heading, Text } from '@radix-ui/themes';
import { FormattedMessage } from 'react-intl';

import type { ProjectResponse } from '@/generated/api-client/src';
import messages from './messages';

type ProjectCardProps = {
  project: ProjectResponse;
};

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <Flex direction="column" gap="2">
        <Heading as="h2" size="5">
          {project.name}
        </Heading>
        <Flex direction="row" gap="4">
          <Text size="2" color="gray">
            <FormattedMessage {...messages.projectCardDefaultLocale} values={{ locale: project.defaultLocale }} />
          </Text>
          <Text size="2" color="gray">
            <FormattedMessage {...messages.projectCardLocalesCount} values={{ count: project.enabledLocales.length }} />
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}

export default ProjectCard;
