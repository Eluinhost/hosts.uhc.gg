import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors } from './FieldWrapper';
import DatePicker from 'react-datepicker';
import TimePicker from 'rc-time-picker';

export interface DateTimeFieldProps extends BaseFieldProps {
  readonly label?: string | React.ReactElement<any>;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly datePickerProps?: Partial<ReactDatePickerProps>;
  readonly timePickerProps?: Partial<RcTimePickerProps>;
}

const renderDateTimePicker: React.SFC<WrappedFieldProps<any> & DateTimeFieldProps> = props => (
  <FieldWrapper meta={props.meta} label={props.label} required={props.required} hideErrors>
    <DatePicker
      {...props.datePickerProps}
      dateFormat="YYYY-MM-DD"
      inline
      selected={props.input ? props.input.value : null}
      onChange={props.input!.onChange}
      disabled={props.disabled}
    >
      <div className="date-time-field-time-section">
        <TimePicker
          {...props.timePickerProps}
          onChange={props.input!.onChange}
          value={props.input ? props.input.value : null}
          className={`date-time-field-time-picker ${(props.timePickerProps || {}).className || ''}`}
          disabled={props.disabled}
        />

        <RenderErrors {...props.meta} />

        {props.children}
      </div>
    </DatePicker>
  </FieldWrapper>
);

export const DateTimeField: React.SFC<DateTimeFieldProps> = props => (
  <Field
    {...props}
    component={renderDateTimePicker}
  />
);
