import { SegmentedControl, type SegmentedControlProps } from '@blueprintjs/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type SegmentedFieldProps = Omit<SegmentedControlProps, 'fill' | 'onValueChange' | 'value'> & {
  field: FieldWithValue<string>;
};

export const SegmentedField: React.FC<SegmentedFieldProps> = ({ field, ...props }) => {
  return (
    <SegmentedControl
      {...props}
      fill
      onValueChange={value => {
        field.handleChange(value);
      }}
      value={field.value}
    />
  );
};
