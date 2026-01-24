import { Flex, Text, Spinner } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';

import type { ProjectResponse } from '@/generated/api-client/src';
import ProjectCard from '../project-card/project-card';
import messages from './messages';

type ProjectsListProps = {
  projects: ProjectResponse[];
  isLoading: boolean;
  isError: boolean;
};

function ProjectsList({ projects, isLoading, isError }: ProjectsListProps) {
  const intl = useIntl();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="9">
        <Spinner size="3" aria-label={intl.formatMessage(messages.loadingProjects)} />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Text as="p" size="3" color="red">
        <FormattedMessage {...messages.errorFetchingProjects} />
      </Text>
    );
  }

  if (projects.length === 0) {
    return (
      <Text as="p" size="3" color="gray">
        <FormattedMessage {...messages.noProjects} />
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="3">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Flex>
  );
}

export default ProjectsList;
