import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { map } from 'ramda';

export type SuggestionsFieldProps = BaseFieldProps & {
  readonly label: string;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly suggestions: string[];
  readonly suggestionText: string;
};

const renderOptions = map<string, React.ReactElement<any>>(it => <option key={it} value={it}>{it}</option>);

const renderField: React.SFC<WrappedFieldProps<any> & SuggestionsFieldProps> = props => (
  <FieldWrapper meta={props.meta} label={props.label} required={props.required}>
    <div className="pt-control-group pt-fill">
      <input
        {...props.input}
        className={`pt-input ${props.className || ''}`}
        placeholder={props.placeholder || props.label}
        type="text"
        disabled={props.disabled}
      />
      <div className="pt-minimal pt-select" style={{ flex: '0' }}>
        <select onChange={props.input!.onChange} value="default" disabled={props.disabled}>
          <option value="default">{props.suggestionText}</option>
          {renderOptions(props.suggestions)}
        </select>
      </div>
    </div>

  </FieldWrapper>
);

export const SuggestionsField: React.SFC<SuggestionsFieldProps> = props => <Field {...props} component={renderField} />;
