import * as React from 'react';
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

const renderField: React.FunctionComponent<WrappedFieldProps & NumberFieldProps> = props => (
  <FieldWrapper meta={props.meta} label={props.label} required={props.required}>
    <input
      {...props.input}
      className={`${Classes.NUMERIC_INPUT} ${!props.meta.valid ? Classes.INTENT_DANGER : ''} ${Classes.INPUT} ${
        props.className || ''
      }`}
      placeholder={props.placeholder || props.label}
      type="number"
      disabled={props.disabled}
      min={props.min}
      max={props.max}
    />
  </FieldWrapper>
);

export const NumberField: React.FunctionComponent<NumberFieldProps> = props => (
  <Field {...props} component={renderField} />
);
