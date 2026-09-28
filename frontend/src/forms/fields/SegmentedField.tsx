import { SegmentedControl, type SegmentedControlProps } from '@mantine/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type SegmentedFieldProps = Omit<SegmentedControlProps, 'onValueChange' | 'value'> & {
  field: FieldWithValue<string>;
};

export const SegmentedField: React.FC<SegmentedFieldProps> = ({ field, ...props }) => {
  return (
    <SegmentedControl
      {...props}
      onChange={value => {
        field.handleChange(value);
      }}
      value={field.value}
    />
  );
};
