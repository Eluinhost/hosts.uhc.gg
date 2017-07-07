import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';

export interface NumberFieldProps extends BaseFieldProps {
  readonly label: string;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly min?: number;
  readonly max?: number;
}

const renderField: React.SFC<WrappedFieldProps<any> & NumberFieldProps> = props => (
  <FieldWrapper meta={props.meta} label={props.label} required={props.required}>
    <input
      {...props.input}
      className={`pt-input ${props.className || ''}`}
      placeholder={props.placeholder || props.label}
      type="number"
      disabled={props.disabled}
      min={props.min}
      max={props.max}
    />
  </FieldWrapper>
);

export const NumberField: React.SFC<NumberFieldProps> = props => <Field {...props} component={renderField} />;
