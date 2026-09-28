import { NumberInput, type NumberInputProps } from '@mantine/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type NumberFieldProps = Omit<
  NumberInputProps,
  'name' | 'value' | 'onChange' | 'onValueChange' | 'onBlur' | 'error'
> & {
  field: FieldWithValue<number>;
};

export const NumberField: React.FC<NumberFieldProps> = ({ field, ...props }) => {
  return (
    <NumberInput
      {...props}
      name={field.name as string}
      value={field.value}
      error={field.errors[0]?.message}
      onValueChange={({ floatValue }) => {
        if (typeof floatValue === 'undefined') {
          return;
        }

        field.handleChange(floatValue);
      }}
      onBlur={field.handleBlur}
    />
  );
};
