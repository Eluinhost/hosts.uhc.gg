import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors, RenderLabel } from '../fields/FieldWrapper';
import { Pre, Tab, Tabs, TextArea } from "@blueprintjs/core";
import * as React from 'react';
import * as snuownd from 'snuownd';

const parser = snuownd.getParser();

type RulesFieldProps = BaseFieldProps & {
  readonly label?: React.ReactElement | string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
};

const RulesTab: React.FunctionComponent<WrappedFieldProps<any> & RulesFieldProps> = ({ input, disabled }) => (
  <TextArea {...input} disabled={disabled} fill rows={15} />
);

const PreviewTab: React.FunctionComponent<WrappedFieldProps<any> & RulesFieldProps> = ({ input }) => (
  <Pre dangerouslySetInnerHTML={{ __html: parser.render(input!.value) }} />
);

const RulesFieldComponent: React.FunctionComponent<WrappedFieldProps<any> & RulesFieldProps> = props => (
  <FieldWrapper meta={props.meta} required={props.required} hideErrors>
    <div className={`markdown-field-wrapper ${props.className || ''}`}>
      {!!props.label && <RenderLabel label={props.label!} required={props.required} />}
      <Tabs id="rules-form-tabs">
        <Tab id="rules-form-rules" title="Template" panel={<RulesTab {...props} />} />
        <Tab id="rules-form-preview" title="Preview" panel={<PreviewTab {...props} />} />
      </Tabs>
    </div>
    <RenderErrors {...props.meta} />
  </FieldWrapper>
);

export const RulesField: React.SFC<RulesFieldProps> = props => <Field {...props} component={RulesFieldComponent} />;
