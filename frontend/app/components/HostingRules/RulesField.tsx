import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors, renderLabel } from '../fields/FieldWrapper';
import { Tab2, Tabs2 } from '@blueprintjs/core';
import * as React from 'react';
import * as snuownd from 'snuownd';

const parser = snuownd.getParser();

type RulesFieldProps = BaseFieldProps & {
  readonly label?: React.ReactElement<any> | string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
};

const RulesTab: React.SFC<WrappedFieldProps<any> & RulesFieldProps> = ({ input, disabled }) => (
  <textarea {...input} disabled={disabled} className="pt-fill pt-input" rows={15}/>
);

const PreviewTab: React.SFC<WrappedFieldProps<any> & RulesFieldProps> = ({ input }) => (
  <pre dangerouslySetInnerHTML={{ __html: parser.render(input!.value) }} />
);

const RulesFieldComponent: React.SFC<WrappedFieldProps<any> & RulesFieldProps> = props => (
  <FieldWrapper meta={props.meta} required={props.required} hideErrors>
    <div className={`markdown-field-wrapper ${props.className || ''}`}>
      {renderLabel(props)}
      <Tabs2 id="rules-form-tabs">
        <Tab2 id="rules-form-rules" title="Template" panel={<RulesTab {...props}/>}/>
        <Tab2 id="rules-form-preview" title="Preview" panel={<PreviewTab {...props}/>}/>
      </Tabs2>
    </div>
    <RenderErrors {...props.meta} />
  </FieldWrapper>
);

export const RulesField: React.SFC<RulesFieldProps> = props => (
  <Field
    {...props}
    component={RulesFieldComponent}
  />
);
