import * as React from 'react';
import { WrappedFieldMetaProps } from 'redux-form';
import { If } from '../If';

export type FieldWrapperProps = {
  readonly label?: string | React.ReactElement<any>;
  readonly required?: boolean;
  readonly meta: WrappedFieldMetaProps<any>;
  readonly hideErrors?: boolean;
  readonly className?: string;
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
  if (error) return <div className="pt-form-helper-text">{error}</div>;

  if (warning) return <div className="pt-form-helper-text">{warning}</div>;

  return null;
};

export const RenderLabel: React.SFC<{ label: string | React.ReactElement<any>; required?: boolean }> = ({
  label,
  required = false,
}) => (
  <label className="pt-label">
    {label}
    <If condition={required}>
      <span className="required-star">*</span>
    </If>
  </label>
);

export const FieldWrapper: React.SFC<FieldWrapperProps> = props => (
  <div className={`pt-form-group ${errorClasses(props.meta)} ${props.className ? props.className : ''}`}>
    <If condition={!!props.label}>
      <RenderLabel label={props.label!} required={props.required} />
    </If>

    <div className="pt-form-content">
      {props.children}

      <If condition={!props.hideErrors}>
        <RenderErrors {...props.meta} />
      </If>
    </div>
  </div>
);
