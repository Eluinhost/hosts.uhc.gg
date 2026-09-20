import { Classes, HTMLSelect, type HTMLSelectProps } from '@blueprintjs/core';
import { type FieldWithValue } from '@tanstack/react-form';
import { clsx } from 'clsx';
import React from 'react';

export type SelectFieldProps = Omit<HTMLSelectProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'fill'> & {
  field: FieldWithValue<string>;
};

export const SelectField: React.FC<SelectFieldProps> = ({ field, ...props }) => {
  return (
    <HTMLSelect
      {...props}
      name={field.name as string}
      value={field.value}
      className={clsx(
        {
          [Classes.INTENT_DANGER]: field.meta.isValid,
        },
        props.className,
      )}
      onChange={e => {
        field.handleChange(e.target.value);
      }}
      onBlur={field.handleBlur}
      fill
    />
  );
};
