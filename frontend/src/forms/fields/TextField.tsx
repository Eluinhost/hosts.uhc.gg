import { TextInput, type TextInputProps } from '@mantine/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type TextFieldProps = Omit<TextInputProps, 'name' | 'value' | 'onChange' | 'onBlur'> & {
  field: FieldWithValue<string>;
};

export const TextField: React.FC<TextFieldProps> = ({ field, ...props }) => {
  return (
    <TextInput
      {...props}
      name={field.name as string}
      value={field.value}
      type={props.type ?? 'text'}
      onChange={e => {
        field.handleChange(e.target.value);
      }}
      onBlur={field.handleBlur}
    />
  );
};
