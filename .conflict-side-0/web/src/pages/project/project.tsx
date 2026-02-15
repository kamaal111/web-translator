import { useParams } from 'react-router';
import { Box, Text } from '@radix-ui/themes';
import { FormattedMessage } from 'react-intl';

import useProject from '@/projects/hooks/use-project';
import ProjectError from '@/projects/components/project-error/project-error';
import ProjectDetails from '@/projects/components/project-details/project-details';
import messages from './messages';

import './project.css';

function Project() {
  const { id } = useParams<{ id: string }>();
  const { project, isLoading, isError, is4xxError } = useProject(id);

  if (isLoading) {
    return (
      <Box className="project-container" px="6" py="5">
        <Text>
          <FormattedMessage {...messages.loading} />
        </Text>
      </Box>
    );
  }

  if (isError || project == null) {
    return <ProjectError is4xxError={is4xxError} />;
  }

  return <ProjectDetails project={project} />;
}

export default Project;
