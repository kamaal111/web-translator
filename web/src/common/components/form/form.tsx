import { useIntl, type MessageDescriptor, FormattedMessage } from 'react-intl';
import z from 'zod';
import { useForm, Controller, type Path, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Flex, Text } from '@radix-ui/themes';

import type { TextFieldProps } from '../text-field/text-field';
import TextField from '../text-field/text-field';
import { formatMessage } from '@/translations/utils';
import messages from './messages';

export type FormField<ID extends string> = {
  id: ID;
  placeholder: string | MessageDescriptor;
  label?: string | MessageDescriptor;
  type?: TextFieldProps['type'];
  invalidMessage?: string | MessageDescriptor;
  autoComplete?: TextFieldProps['autoComplete'];
};

type RequiredKeys<T> = {
  [Key in keyof T]-?: undefined extends T[Key] ? never : Key;
}[keyof T];

type RequiredFieldIds<TSchema extends z.ZodObject<z.ZodRawShape>> = RequiredKeys<z.input<TSchema>>;

type EnsureAllRequiredFields<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  TFields extends ReadonlyArray<FormField<Path<z.input<TSchema>>>>,
> = RequiredFieldIds<TSchema> extends TFields[number]['id'] ? TFields : never;

type FormProps<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  TFields extends ReadonlyArray<FormField<Path<z.input<TSchema>>>>,
> = {
  schema: TSchema;
  fields: EnsureAllRequiredFields<TSchema, TFields>;
  disable?: boolean;
  onSubmit: SubmitHandler<z.input<TSchema>>;
};

type TextFieldsProps<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  TFields extends ReadonlyArray<FormField<Path<z.input<TSchema>>>>,
> = {
  fields: EnsureAllRequiredFields<TSchema, TFields>;
  form: UseFormReturn<z.core.input<TSchema>, unknown, z.core.input<TSchema>>;
  disable?: boolean;
};

function Form<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  TFields extends ReadonlyArray<FormField<Path<z.input<TSchema>>>>,
>({ schema, fields, disable, onSubmit }: FormProps<TSchema, TFields>) {
  const form = useForm<z.input<TSchema>, unknown, z.input<TSchema>>({
    resolver: zodResolver(schema, undefined, { raw: true }),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="form">
      <Card size="4">
        <Flex direction="column">
          <TextFields fields={fields} form={form} disable={disable} />
          <Flex justify="end" gap="3" align="center">
            <SubmitButton disable={disable} />
          </Flex>
        </Flex>
      </Card>
    </form>
  );
}

function SubmitButton({ disable }: { disable?: boolean }) {
  return (
    <Button variant="outline" type="submit" disabled={disable}>
      <FormattedMessage {...messages.submit} />
    </Button>
  );
}

function TextFields<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  TFields extends ReadonlyArray<FormField<Path<z.input<TSchema>>>>,
>({ fields, form, disable }: TextFieldsProps<TSchema, TFields>) {
  const intl = useIntl();

  if (fields.length === 0) {
    return null;
  }

  return (
    <>
      {fields.map(field => {
        return (
          <Controller
            key={field.id}
            name={field.id}
            control={form.control}
            render={({ field: controllerField, fieldState }) => (
              <TextField
                name={controllerField.name}
                value={(controllerField.value as string) ?? ''}
                onChange={controllerField.onChange}
                onBlur={controllerField.onBlur}
                ref={controllerField.ref}
                placeholder={formatMessage(intl, field.placeholder)}
                invalidMessage={formatMessage(intl, field.invalidMessage)}
                isInvalid={fieldState.invalid}
                type={field.type}
                autoComplete={field.autoComplete}
                disabled={disable}
                label={
                  field.label != null
                    ? () => {
                        return (
                          <Text as="label" size="2">
                            {formatMessage(intl, field.label)}
                          </Text>
                        );
                      }
                    : null
                }
              />
            )}
          />
        );
      })}
    </>
  );
}

Form.displayName = 'Form';

export default Form;
