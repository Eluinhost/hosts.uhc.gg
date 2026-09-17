import { Switch } from '@blueprintjs/core';
import React, { useCallback } from 'react';
import { type BaseFieldProps, Field, type WrappedFieldProps } from 'redux-form';

import { FieldWrapper } from './FieldWrapper';

export interface SwitchFieldProps extends BaseFieldProps {
  readonly label: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

const Switcher: React.FC<WrappedFieldProps & SwitchFieldProps> = props => {
  const { input, disabled, className, label, meta } = props;
  const { onBlur, onChange } = input;

  const handleChange = useCallback((): void => {
    if (disabled) return;

    onChange(!(input.value as boolean));
    onBlur(!(input.value as boolean));
  }, [disabled, onChange, onBlur, input.value]);

  return (
    <FieldWrapper meta={meta} label={label} required>
      <Switch
        checked={!!input.value}
        className={className || ''}
        disabled={disabled}
        label={label}
        onChange={handleChange}
      />
    </FieldWrapper>
  );
};

export const SwitchField: React.FC<SwitchFieldProps> = props => <Field {...props} component={Switcher} />;
