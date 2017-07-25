import * as React from 'react';
import { WrappedFieldMetaProps } from 'redux-form';

export type FieldWrapperProps = {
  readonly label?: string | React.ReactElement<any>;
  readonly required?: boolean;
  readonly meta: WrappedFieldMetaProps<any>;
  readonly hideErrors?: boolean
};

export const errorClasses = (meta: WrappedFieldMetaProps<any>) => {
  if (meta.error) {
    return 'pt-intent-danger';
  }

  if (meta.warning) {
    return 'pt-intent-warning';
  }

  return '';
};

export const RenderErrors: React.SFC<WrappedFieldMetaProps<any>> = ({ error, warning }) => {
  if (error)
    return <div className="pt-form-helper-text">{error}</div>;

  if (warning)
    return <div className="pt-form-helper-text">{warning}</div>;

  return null;
};

export const renderLabel: React.SFC<{ label?: string, required?: boolean }> = ({ label, required }) => {
  if (!label)
    return null;

  return (
    <label className="pt-label">
      {label}{required && <span className="required-star">*</span>}
    </label>
  );
};

export const FieldWrapper: React.SFC<FieldWrapperProps> = props => (
  <div className={`pt-form-group ${errorClasses(props.meta)}`}>
    {renderLabel(props)}
    <div className="pt-form-content">
      {props.children}
      {!props.hideErrors && <RenderErrors {...props.meta} />}
    </div>
  </div>
);

