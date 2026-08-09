import React, { useCallback } from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { Switch } from '@blueprintjs/core';

export interface SwitchFieldProps extends BaseFieldProps {
  readonly label: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

const Switcher: React.FC<WrappedFieldProps & SwitchFieldProps> = props => {
  const {
    input: { value, onChange, onBlur },
    disabled,
    className,
    label,
    meta,
  } = props;

  const handleChange = useCallback((): void => {
    if (disabled) return;

    onChange(!value);
    onBlur(!value);
  }, [disabled, onChange, onBlur, value]);

  return (
    <FieldWrapper meta={meta} label={label} required>
      <Switch
        checked={!!value}
        className={className || ''}
        disabled={disabled}
        label={label}
        onChange={handleChange}
      />
    </FieldWrapper>
  );
};

export const SwitchField: React.FC<SwitchFieldProps> = props => (
  <Field {...props} component={Switcher} />
);
