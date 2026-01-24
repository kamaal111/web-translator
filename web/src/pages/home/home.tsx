import { useState } from 'react';
import { Box, Flex, Heading } from '@radix-ui/themes';
import { FormattedMessage } from 'react-intl';

import useProjects from '@/projects/hooks/use-projects';
import CreateProjectDialog from '../../projects/components/create-project-dialog/create-project-dialog';
import ProjectsList from '../../projects/components/projects-list/projects-list';
import messages from './messages';

import './home.css';

function Home() {
  const { projects, isLoading, isError } = useProjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Box className="home-container" px="6" py="5">
      <Flex justify="between" align="center" mb="4">
        <Heading as="h1" size="8">
          <FormattedMessage {...messages.title} />
        </Heading>
        <CreateProjectDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </Flex>

      <ProjectsList projects={projects} isLoading={isLoading} isError={isError} />
    </Box>
  );
}

export default Home;
