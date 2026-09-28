import { TextInput, type TextInputProps } from '@mantine/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type TextFieldProps = Omit<TextInputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error'> & {
  field: FieldWithValue<string>;
};

export const TextField: React.FC<TextFieldProps> = ({ field, ...props }) => {
  return (
    <TextInput
      {...props}
      name={field.name as string}
      error={field.errors[0]?.message}
      value={field.value}
      onChange={e => {
        field.handleChange(e.target.value);
      }}
      onBlur={field.handleBlur}
    />
  );
};
