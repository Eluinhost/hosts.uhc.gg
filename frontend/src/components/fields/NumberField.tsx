import React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { Classes } from '@blueprintjs/core';

export interface NumberFieldProps extends BaseFieldProps {
  readonly label: string;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly min?: number;
  readonly max?: number;
}

const renderField: React.FC<WrappedFieldProps & NumberFieldProps> = props => {
  const { meta, label, required, input, placeholder, disabled, className, min, max } = props;

  return (
    <FieldWrapper meta={meta} label={label} required={required}>
      <input
        {...input}
        className={`${Classes.NUMERIC_INPUT} ${!meta.valid ? Classes.INTENT_DANGER : ''} ${Classes.INPUT} ${className || ''}`}
        placeholder={placeholder || label}
        type="number"
        disabled={disabled}
        min={min}
        max={max}
      />
    </FieldWrapper>
  );
};

export const NumberField: React.FC<NumberFieldProps> = props => (
  <Field {...props} component={renderField} />
);
