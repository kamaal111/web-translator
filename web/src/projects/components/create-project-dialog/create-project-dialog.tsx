import { Button, Dialog, Flex } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';
import z from 'zod';
import { BaseCreateProjectSchema } from '@wt/schemas';

import useCreateProject from '@/projects/hooks/use-create-project';
import Form from '@/common/components/form/form';
import type { CreateProjectPayload } from '@/generated/api-client/src';
import messages from './messages';

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CreateProject = z.infer<typeof CreateProjectSchema>;

const CreateProjectSchema = BaseCreateProjectSchema.omit({ enabled_locales: true }).extend({
  enabledLocales: z.string().nullish(),
});

function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const intl = useIntl();

  const { createProject, isCreating } = useCreateProject({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

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
          fields={[
            {
              id: 'name',
              label: intl.formatMessage(messages.projectNameLabel),
              placeholder: intl.formatMessage(messages.projectNamePlaceholder),
            },
            {
              id: 'default_locale',
              label: intl.formatMessage(messages.defaultLocaleLabel),
              placeholder: intl.formatMessage(messages.defaultLocalePlaceholder),
            },
            {
              id: 'enabledLocales',
              label: intl.formatMessage(messages.enabledLocalesLabel),
              placeholder: intl.formatMessage(messages.enabledLocalesPlaceholder),
            },
            {
              id: 'public_read_key',
              label: intl.formatMessage(messages.publicReadKeyLabel),
              placeholder: intl.formatMessage(messages.publicReadKeyPlaceholder),
              renderAddon: form => {
                return (
                  <Button
                    type="button"
                    variant="soft"
                    onClick={() => {
                      const key = crypto.randomUUID();
                      form.setValue('public_read_key', key);
                    }}
                    aria-label={intl.formatMessage(messages.generateKeyButtonAriaLabel)}
                  >
                    <FormattedMessage {...messages.generateKeyButton} />
                  </Button>
                );
              },
            },
          ]}
          disable={isCreating}
          onSubmit={data => createProject(mapFormDataToCreateProjectPayload(data))}
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

function mapFormDataToCreateProjectPayload(data: CreateProject): CreateProjectPayload {
  const enabledLocales =
    data.enabledLocales
      ?.split(',')
      .map(locale => locale.trim())
      .filter(locale => locale.length > 0) ?? [];

  return {
    name: data.name,
    defaultLocale: data.default_locale,
    enabledLocales,
    publicReadKey: data.public_read_key,
  };
}

export default CreateProjectDialog;
