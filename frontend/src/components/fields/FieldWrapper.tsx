import * as React from 'react';
import { WrappedFieldMetaProps } from 'redux-form';
import { Classes, FormGroup, Intent, Label } from "@blueprintjs/core";

export type FieldWrapperProps = {
  readonly label?: string | React.ReactElement<any>;
  readonly required?: boolean;
  readonly meta: WrappedFieldMetaProps<any>;
  readonly hideErrors?: boolean;
  readonly className?: string;
};

const formIntent = (meta: WrappedFieldMetaProps<any>): Intent => {
  if (meta.error) {
    return Intent.DANGER;
  }

  if (meta.warning) {
    return Intent.WARNING;
  }

  return Intent.NONE;
};

export const RenderErrors: React.FunctionComponent<WrappedFieldMetaProps<any>> = ({ error, warning }) => {
  if (error) return <div className={Classes.FORM_HELPER_TEXT}>{error}</div>;

  if (warning) return <div className={Classes.FORM_HELPER_TEXT}>{warning}</div>;

  return null;
};

export const RenderLabel: React.FunctionComponent<{ label: string | React.ReactElement<any>; required?: boolean }> = ({
  label,
  required = false,
}) => (
  <Label>
    {label}
    {required && <span className="required-star">*</span>}
  </Label>
);

export const FieldWrapper: React.FunctionComponent<FieldWrapperProps> = props => (
  <FormGroup intent={formIntent(props.meta)} className={props.className}>
    {!!props.label && <RenderLabel label={props.label!} required={props.required} />}

    <div className={Classes.FORM_CONTENT}>
      {props.children}

      {!props.hideErrors && <RenderErrors {...props.meta} />}
    </div>
  </FormGroup>
);
