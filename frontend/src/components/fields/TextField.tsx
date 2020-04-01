import * as React from 'react';
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

const renderField: React.FunctionComponent<WrappedFieldProps & TextFieldProps> = props => (
  <FieldWrapper meta={props.meta} label={props.label} required={props.required}>
    <input
      {...props.input}
      className={`${Classes.INPUT} ${!props.meta.valid ? Classes.INTENT_DANGER : ''} ${props.className || ''}`}
      placeholder={props.placeholder || props.label}
      type={props.isPassword ? 'password' : 'text'}
      disabled={props.disabled}
    />
  </FieldWrapper>
);

export const TextField: React.FunctionComponent<TextFieldProps> = props => <Field {...props} component={renderField} />;
