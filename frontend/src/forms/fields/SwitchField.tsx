import { Switch, type SwitchProps } from '@mantine/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type SwitchFieldProps = Omit<SwitchProps, 'name' | 'checked' | 'onChange' | 'onBlur' | 'error'> & {
  field: FieldWithValue<boolean>;
};

export const SwitchField: React.FC<SwitchFieldProps> = ({ field, ...props }) => {
  return (
    <Switch
      {...props}
      name={field.name as string}
      error={field.errors[0]?.message}
      checked={field.value}
      onChange={e => {
        if (props.disabled) return;

        field.handleChange(e.target.checked);
        field.handleBlur();
      }}
      onBlur={field.handleBlur}
    />
  );
};
