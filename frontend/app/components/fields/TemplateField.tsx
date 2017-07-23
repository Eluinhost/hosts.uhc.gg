import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, renderLabel } from './FieldWrapper';
import * as Snuownd from 'snuownd';
import * as Mark from 'markup-js';

const parser = Snuownd.getParser();

export interface TemplateFieldProps extends BaseFieldProps {
  readonly label: string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly context: any;
}

const renderTemplateField: React.SFC<WrappedFieldProps<any> & TemplateFieldProps> = props => (
  <FieldWrapper meta={props.meta} required={props.required} hideErrors>
    <div className={`markdown-field-wrapper ${props.className || ''}`}>
      <div>
        {renderLabel(props)}
        <textarea {...props.input} disabled={props.disabled} className="pt-fill pt-input"/>
      </div>
      <div>
        {renderLabel({ label: 'Preview', required: false })}
        <pre dangerouslySetInnerHTML={{ __html: parser.render(Mark.up(props.input!.value, props.context)) }} />
      </div>
    </div>
  </FieldWrapper>
);

export const TemplateField: React.SFC<TemplateFieldProps> = props => (
  <Field
    {...props}
    component={renderTemplateField}
  />
);
