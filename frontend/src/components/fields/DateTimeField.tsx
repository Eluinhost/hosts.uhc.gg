import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldMetaProps, WrappedFieldProps } from "redux-form";
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import * as moment from 'moment';
import { Callout, Intent, Overlay } from "@blueprintjs/core";

import { FieldWrapper } from './FieldWrapper';

export interface DateTimeFieldProps extends BaseFieldProps {
  readonly label?: string | React.ReactElement;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly datePickerProps?: Partial<ReactDatePickerProps>;
  readonly disableTime?: boolean;
}

export const Errors: React.FunctionComponent<WrappedFieldMetaProps<any>> = ({ error, warning }) => {
  if (error) return <Callout intent={Intent.DANGER}>{error}</Callout>;

  if (warning) return <Callout intent={Intent.WARNING}>{warning}</Callout>;

  return null;
};

class DateTimePicker extends React.Component<WrappedFieldProps<any> & DateTimeFieldProps> {
  triggerBlur = (date: moment.Moment): void => this.props.input!.onBlur(date, undefined, undefined);

  onDateChange = (date: Date | null): void => {
    if (this.props.disabled) return;

    let momentDate = date && moment.utc(date);

    this.props.input!.onChange(momentDate, undefined, undefined);
    this.props.input!.onBlur(momentDate, undefined, undefined);
  };

  render() {
    const { meta, label, required, datePickerProps, input, disabled } = this.props;

    return (
      <FieldWrapper meta={meta} label={label} required={required} hideErrors className="date-time-field">
        <div className="date-time-field_content">
          <DatePicker
            {...datePickerProps}
            dateFormat="yyyy-MM-dd"
            inline
            selected={input?.value?.isValid() ? input.value.toDate() : null}
            onChange={this.onDateChange}
            showTimeSelect={!this.props.disableTime}
          />
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
