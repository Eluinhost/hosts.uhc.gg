import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { Switch } from '@blueprintjs/core';

export interface SwitchFieldProps extends BaseFieldProps {
  readonly label: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

class Switcher extends React.PureComponent<WrappedFieldProps & SwitchFieldProps> {
  onChange = (): void => {
    if (this.props.disabled) return;

    this.props.input.onChange(!this.props.input.value);
    this.props.input.onBlur(!this.props.input.value);
  };

  render() {
    return (
      <FieldWrapper meta={this.props.meta} required>
        <Switch
          checked={!!this.props.input.value}
          className={this.props.className || ''}
          disabled={this.props.disabled}
          label={this.props.label}
          onChange={this.onChange}
        />
      </FieldWrapper>
    );
  }
}

export const SwitchField: React.FunctionComponent<SwitchFieldProps> = props => (
  <Field {...props} component={Switcher} />
);
