import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors, renderLabel } from './FieldWrapper';
import * as Snuownd from 'snuownd';
import * as Mark from 'markup-js';
import * as moment from 'moment';

const parser = Snuownd.getParser();

export interface TemplateFieldProps extends BaseFieldProps {
  readonly label: string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly context: any;
}

const renderText = (template: string, context: any) => ({
  __html: parser.render(Mark.up(template, context, {
    pipes: {
      moment: (date: moment.Moment, format: string) => date.utc().format(format),
    },
  })),
});

const renderTemplateField: React.SFC<WrappedFieldProps<any> & TemplateFieldProps> = props => (
  <FieldWrapper meta={props.meta} required={props.required} hideErrors>
    <div className={`markdown-field-wrapper ${props.className || ''}`}>
      <div>
        {renderLabel(props)}
        <textarea {...props.input} disabled={props.disabled} className="pt-fill pt-input" rows={15}/>
      </div>
      <div>
        {renderLabel({ label: 'Preview', required: false })}
        <pre dangerouslySetInnerHTML={renderText(props.input!.value, props.context)} />
      </div>
    </div>
    <RenderErrors {...props.meta} />
  </FieldWrapper>
);

export const TemplateField: React.SFC<TemplateFieldProps> = props => (
  <Field
    {...props}
    component={renderTemplateField}
  />
);
