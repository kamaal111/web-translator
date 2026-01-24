import { Button, Dialog, Flex } from '@radix-ui/themes';
import { FormattedMessage } from 'react-intl';
import z from 'zod';
import { BaseCreateProjectSchema } from '@wt/schemas';

import useCreateProject from '@/projects/hooks/use-create-project';
import Form from '@/common/components/form/form';
import messages from './messages';

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CreateProject = z.infer<typeof CreateProjectSchema>;

const FIELDS = [
  {
    id: 'name',
    label: messages.projectNameLabel,
    placeholder: messages.projectNamePlaceholder,
  },
  {
    id: 'default_locale',
    label: messages.defaultLocaleLabel,
    placeholder: messages.defaultLocalePlaceholder,
  },
  {
    id: 'enabledLocales',
    label: messages.enabledLocalesLabel,
    placeholder: messages.enabledLocalesPlaceholder,
  },
  {
    id: 'public_read_key',
    label: messages.publicReadKeyLabel,
    placeholder: messages.publicReadKeyPlaceholder,
  },
] as const;

const CreateProjectSchema = BaseCreateProjectSchema.omit({ enabled_locales: true }).extend({
  enabledLocales: z.string(),
});

function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { createProject, isCreating } = useCreateProject({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleCreateProject = (data: CreateProject) => {
    const enabledLocales = data.enabledLocales
      .split(',')
      .map(locale => locale.trim())
      .filter(locale => locale.length > 0);

    createProject({
      name: data.name,
      defaultLocale: data.default_locale,
      enabledLocales,
      publicReadKey: data.public_read_key,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger>
        <Button>
          <FormattedMessage {...messages.createProjectButton} />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>
          <FormattedMessage {...messages.createProjectDialogTitle} />
        </Dialog.Title>
        <Dialog.Description size="2" mb="4">
          <FormattedMessage {...messages.createProjectDialogDescription} />
        </Dialog.Description>

        <Form
          schema={CreateProjectSchema}
          fields={FIELDS}
          disable={isCreating}
          onSubmit={handleCreateProject}
          showCard={false}
        />

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              <FormattedMessage {...messages.createProjectDialogCancel} />
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default CreateProjectDialog;
