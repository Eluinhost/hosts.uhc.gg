import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldMetaProps, WrappedFieldProps } from "redux-form";
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import moment from 'moment-timezone';
import { Callout, Intent, Overlay } from "@blueprintjs/core";

import { FieldWrapper } from './FieldWrapper';

export interface DateTimeFieldProps extends BaseFieldProps {
  readonly label?: string | React.ReactElement;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly datePickerProps?: Partial<ReactDatePickerProps>;
  readonly disableTime?: boolean;
  readonly renderClearButton?: React.ComponentType<{ value: any, onClear: () => void }>
}

export const Errors: React.FunctionComponent<WrappedFieldMetaProps> = ({ error, warning }) => {
  if (error) return <Callout intent={Intent.DANGER}>{error}</Callout>;

  if (warning) return <Callout intent={Intent.WARNING}>{warning}</Callout>;

  return null;
};

class DateTimePicker extends React.Component<WrappedFieldProps & DateTimeFieldProps> {
  triggerBlur = (date: moment.Moment): void => this.props.input.onChange(date);

  handleDateChange = (date: Date | null): void => {
    if (this.props.disabled) return;

    let momentDate = date && moment(date.getTime());

    this.props.input.onChange(momentDate);
    this.props.input.onBlur(momentDate);
  };

  handleClear = () => this.handleDateChange(null);

  render() {
    const { meta, label, required, datePickerProps, input, disabled, renderClearButton: ClearButton } = this.props;

    return (
      <FieldWrapper meta={meta} label={label} required={required} hideErrors className="date-time-field">
        <div className="date-time-field_content">
          <DatePicker
            {...datePickerProps}
            dateFormat="yyyy-MM-dd"
            inline
            selected={input?.value?.isValid() ? (input.value as moment.Moment).toDate() : null}
            onChange={this.handleDateChange}
            showTimeSelect={!this.props.disableTime}
          >
            {ClearButton && <ClearButton value={input?.value} onClear={this.handleClear} />}
          </DatePicker>
          <Errors {...meta} />
        </div>
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

export const DateTimeField: React.FunctionComponent<DateTimeFieldProps> = props => <Field {...props} component={DateTimePicker} />;
