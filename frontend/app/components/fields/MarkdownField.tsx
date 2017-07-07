import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, renderLabel } from './FieldWrapper';
import * as Snuownd from 'snuownd';

const parser = Snuownd.getParser();

export interface MarkdownFieldProps extends BaseFieldProps {
  readonly label: string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

const renderMarkdown: React.SFC<WrappedFieldProps<any> & MarkdownFieldProps> = props => (
  <FieldWrapper meta={props.meta} required={props.required} hideErrors>
    <div className={`markdown-field-wrapper ${props.className || ''}`}>
      <div>
        {renderLabel(props)}
        <textarea {...props.input} disabled={props.disabled} className="pt-fill pt-input"/>
      </div>
      <div>
        {renderLabel({ label: 'Preview', required: false })}
        <pre dangerouslySetInnerHTML={{ __html: parser.render(props.input!.value) }} />
      </div>
    </div>
  </FieldWrapper>
);

export const MarkdownField: React.SFC<MarkdownFieldProps> = props => (
  <Field
    {...props}
    component={renderMarkdown}
  />
);
