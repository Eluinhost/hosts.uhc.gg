import React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { Classes } from '@blueprintjs/core';

export type TextFieldProps = BaseFieldProps & {
  readonly label: string;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly isPassword?: string;
  readonly disabled?: boolean;
  readonly className?: string;
};

const renderField: React.FC<WrappedFieldProps & TextFieldProps> = props => {
  const {
    meta,
    label,
    required,
    input,
    placeholder,
    isPassword,
    disabled,
    className,
  } = props;

  return (
    <FieldWrapper meta={meta} label={label} required={required}>
      <input
        {...input}
        className={`${Classes.INPUT} ${!meta.valid ? Classes.INTENT_DANGER : ''} ${className || ''}`}
        placeholder={placeholder || label}
        type={isPassword ? 'password' : 'text'}
        disabled={disabled}
      />
    </FieldWrapper>
  );
};

export const TextField: React.FC<TextFieldProps> = props => (
  <Field {...props} component={renderField} />
);
