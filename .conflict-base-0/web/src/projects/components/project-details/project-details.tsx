import { useState } from 'react';
import { Box, Button, Flex, Heading, Text, Card, Badge, IconButton } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';
import { EyeOpenIcon, EyeClosedIcon, CopyIcon, PlusIcon } from '@radix-ui/react-icons';
import toast from 'react-hot-toast';

import type { ProjectResponse } from '@/generated/api-client/src';
import PublishButton from '@/projects/components/publish-button/publish-button';
import StringsList from '@/projects/components/strings-list/strings-list';
import CreateStringDialog from '@/projects/components/create-string-dialog/create-string-dialog';
import messages from './messages';

import './project-details.css';

interface ProjectDetailsProps {
  project: ProjectResponse;
}

function ProjectDetails({ project }: ProjectDetailsProps) {
  const intl = useIntl();
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(project.publicReadKey);
    toast.success(intl.formatMessage(messages.keyCopied));
  };

  const toggleKeyVisibility = () => {
    setIsKeyVisible(!isKeyVisible);
  };

  const displayedKey = isKeyVisible ? project.publicReadKey : '•'.repeat(project.publicReadKey.length);

  return (
    <Box className="project-container" px="6" py="5">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading as="h1" size="8">
            {project.name}
          </Heading>
          <Flex gap="2" align="center">
            <Button onClick={() => setIsCreateDialogOpen(true)} aria-label={intl.formatMessage(messages.createString)}>
              <PlusIcon />
              <FormattedMessage {...messages.createString} />
            </Button>
            <PublishButton projectId={project.id} />
          </Flex>
        </Flex>

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
              <Flex gap="2" direction="column">
                <Text size="2" weight="bold" color="gray">
                  <FormattedMessage {...messages.publicReadKey} />
                </Text>
                <Flex gap="2" align="center">
                  <Text size="2" className="project-details-public-key">
                    {displayedKey}
                  </Text>
                  <IconButton
                    size="1"
                    variant="ghost"
                    onClick={toggleKeyVisibility}
                    aria-label={intl.formatMessage(isKeyVisible ? messages.hideKey : messages.showKey)}
                  >
                    {isKeyVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </IconButton>
                  <IconButton
                    size="1"
                    variant="ghost"
                    onClick={handleCopyKey}
                    aria-label={intl.formatMessage(messages.copyKey)}
                  >
                    <CopyIcon />
                  </IconButton>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Card>

        <StringsList projectId={project.id} />
      </Flex>

      <CreateStringDialog
        projectId={project.id}
        defaultLocale={project.defaultLocale}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </Box>
  );
}

export default ProjectDetails;
