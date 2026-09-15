import { Pre, Tab, Tabs, TextArea } from '@blueprintjs/core';
import React from 'react';
import { type BaseFieldProps, Field, type WrappedFieldProps } from 'redux-form';
import * as snuownd from 'snuownd';

import { FieldWrapper, RenderErrors, RenderLabel } from '../fields/FieldWrapper';

const parser = snuownd.getParser();

type RulesFieldProps = BaseFieldProps & {
  readonly label?: React.ReactElement | string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
};

const RulesTab: React.FunctionComponent<WrappedFieldProps & RulesFieldProps> = ({ input, disabled }) => (
  <TextArea {...input} disabled={disabled} fill rows={15} />
);

const PreviewTab: React.FunctionComponent<WrappedFieldProps & RulesFieldProps> = ({ input }) => (
  <Pre
    dangerouslySetInnerHTML={{
      __html: parser.render(typeof input.value === 'string' ? input.value : String(input.value)),
    }}
  />
);

const RulesFieldComponent: React.FunctionComponent<WrappedFieldProps & RulesFieldProps> = props => {
  const { meta, required, className, label } = props;

  return (
    <FieldWrapper meta={meta} required={required} hideErrors>
      <div className={`markdown-field-wrapper ${className || ''}`}>
        {!!label && <RenderLabel label={label} required={required} />}
        <Tabs id="rules-form-tabs">
          <Tab id="rules-form-rules" title="Template" panel={<RulesTab {...props} />} />
          <Tab id="rules-form-preview" title="Preview" panel={<PreviewTab {...props} />} />
        </Tabs>
      </div>
      <RenderErrors {...meta} />
    </FieldWrapper>
  );
};

export const RulesField: React.FunctionComponent<RulesFieldProps> = props => (
  <Field {...props} component={RulesFieldComponent} />
);
