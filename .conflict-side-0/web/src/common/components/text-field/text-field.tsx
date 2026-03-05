import React from 'react';
import { Box, TextField as RadixTextField } from '@radix-ui/themes';
import clsx from 'clsx';

import './text-field.css';

type InputProps = Pick<React.ComponentProps<'input'>, 'onFocus' | 'onChange' | 'disabled' | 'onBlur' | 'autoComplete'>;

type RootRadixFieldProps = React.ComponentProps<typeof RadixTextField.Root>;

export type TextFieldProps = InputProps & {
  label?: (() => React.ReactElement) | null;
  placeholder: string;
  id?: string;
  value?: string;
  type?: RootRadixFieldProps['type'];
  isInvalid?: boolean;
  invalidMessage?: string | null;
  name?: string;
  defaultValue?: string | number;
};

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label: Label,
      placeholder,
      id,
      value,
      type,
      isInvalid,
      invalidMessage,
      autoComplete,
      name,
      defaultValue,
      ...inputProps
    },
    ref,
  ) => {
    return (
      <Box mb="5" position="relative">
        {Label != null ? <Label /> : null}
        <RadixTextField.Root
          className={clsx(isInvalid && 'isInvalid')}
          type={type}
          value={value}
          placeholder={placeholder}
          id={id}
          autoComplete={autoComplete}
          name={name}
          defaultValue={defaultValue}
          ref={ref}
          {...inputProps}
        />
        {isInvalid && invalidMessage ? <p className="invalidMessage">{invalidMessage}</p> : null}
      </Box>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
