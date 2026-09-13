import React from 'react';
import { WrappedFieldMetaProps } from 'redux-form';
import { Classes, FormGroup, Intent, Label } from '@blueprintjs/core';

export type FieldWrapperProps = {
  readonly label?: string | React.ReactElement;
  readonly required?: boolean;
  readonly meta: WrappedFieldMetaProps;
  readonly hideErrors?: boolean;
  readonly className?: string;
};

const formIntent = (meta: WrappedFieldMetaProps): Intent => {
  if (meta.error) {
    return Intent.DANGER;
  }

  if (meta.warning) {
    return Intent.WARNING;
  }

  return Intent.NONE;
};

export const RenderErrors: React.FC<WrappedFieldMetaProps> = ({ error, warning }) => {
  if (error) return <div className={Classes.FORM_HELPER_TEXT}>{error}</div>;

  if (warning) return <div className={Classes.FORM_HELPER_TEXT}>{warning}</div>;

  return null;
};

export const RenderLabel: React.FC<{ label: string | React.ReactElement; required?: boolean }> = ({
  label,
  required = false,
}) => (
  <Label>
    {label}
    {required && <span className="required-star">*</span>}
  </Label>
);

export const FieldWrapper: React.FC<FieldWrapperProps> = props => {
  const { meta, label, required, hideErrors, className, children } = props;

  return (
    <FormGroup intent={formIntent(meta)} className={className}>
      {!!label && <RenderLabel label={label!} required={required} />}

      <div className={Classes.FORM_CONTENT}>
        {children}

        {!hideErrors && <RenderErrors {...meta} />}
      </div>
    </FormGroup>
  );
};
