import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors } from './FieldWrapper';
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import TimePicker, { RcTimePickerProps } from 'rc-time-picker';
import * as moment from 'moment';
import { Overlay } from '@blueprintjs/core';

export interface DateTimeFieldProps extends BaseFieldProps {
  readonly label?: string | React.ReactElement<any>;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly datePickerProps?: Partial<ReactDatePickerProps>;
  readonly timePickerProps?: Partial<RcTimePickerProps>;
  readonly disableTime?: boolean;
}

class DateTimePicker extends React.Component<WrappedFieldProps<any> & DateTimeFieldProps> {
  triggerBlur = (date: moment.Moment): void => this.props.input!.onBlur(date, undefined, undefined);

  onDateChange = (date: moment.Moment | null): void => {
    if (this.props.disabled) return;

    this.props.input!.onChange(date, undefined, undefined);
    setTimeout(() => this.triggerBlur(this.props.input!.value), 0);
  };

  onTimeChange = (date: moment.Moment | null): void => {
    if (this.props.disabled) return;

    this.props.input!.onChange(date, undefined, undefined);
  };

  onTimeClose = (): void => this.triggerBlur(this.props.input!.value);

  render() {
    const { meta, label, required, datePickerProps, input, disabled, timePickerProps, children } = this.props;

    const time = this.props.disableTime ? null : (
      <TimePicker
        {...timePickerProps}
        onChange={this.onTimeChange}
        value={input ? input.value : null}
        className={`date-time-field-time-picker ${(timePickerProps || {}).className || ''}`}
        disabled={disabled}
        onClose={this.onTimeClose}
      />
    );

    return (
      <FieldWrapper meta={meta} label={label} required={required} hideErrors className="date-time-field">
        <DatePicker
          {...datePickerProps}
          dateFormat="YYYY-MM-DD"
          inline
          selected={input ? input.value : null}
          onChange={this.onDateChange}
        >
          <div className="date-time-field-time-section">
            {time}

            <RenderErrors {...meta} />

            {children}
          </div>
        </DatePicker>
        <Overlay
          hasBackdrop
          isOpen={!!disabled}
          usePortal={false}
          autoFocus={false}
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
        >
          <div />
        </Overlay>
      </FieldWrapper>
    );
  }
}

export const DateTimeField: React.SFC<DateTimeFieldProps> = props => <Field {...props} component={DateTimePicker} />;
