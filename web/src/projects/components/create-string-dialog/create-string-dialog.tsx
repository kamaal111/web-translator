import { Button, Dialog, Flex } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';
import z from 'zod';
import toast from 'react-hot-toast';

import useCreateString from '@/projects/hooks/use-create-string';
import Form from '@/common/components/form/form';
import messages from './messages';

import './create-string-dialog.css';

const CreateStringSchema = z.object({
  key: z.string().min(1),
  context: z.string().nullish(),
  translation: z.string().min(1),
});

interface CreateStringDialogProps {
  projectId: string;
  defaultLocale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateStringDialog({ projectId, defaultLocale, open, onOpenChange }: CreateStringDialogProps) {
  const intl = useIntl();

  const { createString, isCreating } = useCreateString({
    projectId,
    onSuccess: () => {
      toast.success(intl.formatMessage(messages.success));
      onOpenChange(false);
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>
          <FormattedMessage {...messages.dialogTitle} />
        </Dialog.Title>
        <Dialog.Description size="2" mb="4">
          <FormattedMessage {...messages.dialogDescription} />
        </Dialog.Description>

        <Form
          schema={CreateStringSchema}
          fields={[
            {
              id: 'key',
              label: intl.formatMessage(messages.keyLabel),
              placeholder: intl.formatMessage(messages.keyPlaceholder),
              invalidMessage: intl.formatMessage(messages.keyRequired),
            },
            {
              id: 'context',
              label: intl.formatMessage(messages.contextLabel),
              placeholder: intl.formatMessage(messages.contextPlaceholder),
            },
            {
              id: 'translation',
              label: intl.formatMessage(messages.translationLabel, { locale: defaultLocale }),
              placeholder: intl.formatMessage(messages.translationPlaceholder),
              invalidMessage: intl.formatMessage(messages.translationRequired),
            },
          ]}
          disable={isCreating}
          onSubmit={data => {
            createString({
              key: data.key,
              context: data.context ?? undefined,
              translations: { [defaultLocale]: data.translation },
            });
          }}
          showCard={false}
        />

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              <FormattedMessage {...messages.cancel} />
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default CreateStringDialog;
