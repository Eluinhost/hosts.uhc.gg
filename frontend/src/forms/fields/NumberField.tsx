import { Intent, NumericInput, type NumericInputProps } from '@blueprintjs/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type NumberFieldProps = Omit<
  NumericInputProps,
  'allowNumericCharactersOnly' | 'name' | 'type' | 'value' | 'intent' | 'onValueChange' | 'onBlur' | 'buttonPosition'
> & {
  field: FieldWithValue<number>;
};

export const NumberField: React.FC<NumberFieldProps> = ({ field, ...props }) => {
  return (
    <NumericInput
      {...props}
      allowNumericCharactersOnly
      name={field.name as string}
      type="number"
      value={field.value.toString(10)}
      intent={!field.meta.isValid ? Intent.DANGER : undefined}
      onValueChange={asNumber => {
        field.handleChange(asNumber);
      }}
      onBlur={field.handleBlur}
      fill
      buttonPosition="none"
    />
  );
};
