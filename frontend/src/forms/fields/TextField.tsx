import { InputGroup, type InputGroupProps, Intent } from '@blueprintjs/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type TextFieldProps = Omit<InputGroupProps, 'name' | 'intent' | 'value' | 'onChange' | 'onBlur'> & {
  field: FieldWithValue<string>;
};

export const TextField: React.FC<TextFieldProps> = ({ field, ...props }) => {
  return (
    <InputGroup
      {...props}
      name={field.name as string}
      intent={field.meta.isValid ? undefined : Intent.DANGER}
      value={field.value}
      type={props.type ?? 'text'}
      onChange={e => {
        field.handleChange(e.target.value);
      }}
      onBlur={field.handleBlur}
    />
  );
};
