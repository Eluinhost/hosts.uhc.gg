import * as React from 'react';
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

const renderSelect: React.FunctionComponent<WrappedFieldProps & SelectFieldProps> = props => (
  <FieldWrapper meta={props.meta} label={props.label} required={props.required}>
    <div className={`${Classes.HTML_SELECT} ${props.className || ''}`}>
      <select {...props.input} disabled={props.disabled} className={!props.meta.valid ? Classes.INTENT_DANGER : ''}>
        {props.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.display}
          </option>
        ))}
      </select>
    </div>
  </FieldWrapper>
);

export const SelectField: React.FunctionComponent<SelectFieldProps> = props => (
  <Field {...props} component={renderSelect} />
);
