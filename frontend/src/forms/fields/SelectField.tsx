import { Select, type SelectProps } from '@mantine/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type SelectFieldProps = Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error'> & {
  field: FieldWithValue<string>;
};

export const SelectField: React.FC<SelectFieldProps> = ({ field, ...props }) => {
  return (
    <Select
      {...props}
      name={field.name as string}
      error={field.errors[0]?.message}
      value={field.value}
      onChange={value => {
        if (value) {
          field.handleChange(value);
        }
      }}
      onBlur={field.handleBlur}
    />
  );
};
