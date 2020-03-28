import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { map } from 'ramda';
import { Classes, ControlGroup } from "@blueprintjs/core";

export type SuggestionsFieldProps = BaseFieldProps & {
  readonly label: string;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly suggestions: string[];
  readonly suggestionText: string;
};

const renderOptions = map<string, React.ReactElement>(it => (
  <option key={it} value={it}>
    {it}
  </option>
));

const renderField: React.FunctionComponent<WrappedFieldProps & SuggestionsFieldProps> = props => (
  <FieldWrapper meta={props.meta} label={props.label} required={props.required}>
    <ControlGroup fill>
      <input
        {...props.input}
        className={`${Classes.INPUT} ${!props.meta.valid ? Classes.INTENT_DANGER : ''} ${props.className || ''}`}
        placeholder={props.placeholder || props.label}
        type="text"
        disabled={props.disabled}
      />
      <div className={`${Classes.MINIMAL} ${Classes.HTML_SELECT}`} style={{ flex: '0' }}>
        <select onChange={props.input.onChange} value="default" disabled={props.disabled}>
          <option value="default">{props.suggestionText}</option>
          {renderOptions(props.suggestions)}
        </select>
      </div>
    </ControlGroup>
  </FieldWrapper>
);

export const SuggestionsField: React.FunctionComponent<SuggestionsFieldProps> = props => <Field {...props} component={renderField} />;
