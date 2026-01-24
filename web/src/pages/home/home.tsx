import { Box, Flex, Heading, Card, Text, Spinner } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';

import useProjects from '@/projects/hooks/use-projects';
import type { ProjectResponse } from '@/generated/api-client/src';
import messages from './messages';

import './home.css';

function Home() {
  const { projects, isLoading, isError } = useProjects();
  const intl = useIntl();

  return (
    <Box className="home-container">
      <Heading as="h1" size="8" mb="4">
        <FormattedMessage {...messages.title} />
      </Heading>

      {isLoading ? (
        <Flex justify="center" align="center" py="9">
          <Spinner size="3" aria-label={intl.formatMessage(messages.loadingProjects)} />
        </Flex>
      ) : isError ? (
        <Text as="p" size="3" color="red">
          <FormattedMessage {...messages.errorFetchingProjects} />
        </Text>
      ) : projects.length === 0 ? (
        <Text as="p" size="3" color="gray">
          <FormattedMessage {...messages.noProjects} />
        </Text>
      ) : (
        <Flex direction="column" gap="3">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Flex>
      )}
    </Box>
  );
}

function ProjectCard({ project }: { project: ProjectResponse }) {
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

export default Home;
