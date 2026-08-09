import React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { Classes } from '@blueprintjs/core';

export interface SelectFieldProps extends BaseFieldProps {
  readonly options: {
    display: string;
    value?: string | number;
  }[];
  readonly className: string;
  readonly label: string;
  readonly required: boolean;
  readonly disabled?: boolean;
}

const renderSelect: React.FC<WrappedFieldProps & SelectFieldProps> = props => {
  const { meta, label, required, input, options, disabled, className } = props;

  return (
    <FieldWrapper meta={meta} label={label} required={required}>
      <div className={`${Classes.HTML_SELECT} ${className || ''}`}>
        <select {...input} disabled={disabled} className={!meta.valid ? Classes.INTENT_DANGER : ''}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
      </div>
    </FieldWrapper>
  );
};

export const SelectField: React.FC<SelectFieldProps> = props => (
  <Field {...props} component={renderSelect} />
);
