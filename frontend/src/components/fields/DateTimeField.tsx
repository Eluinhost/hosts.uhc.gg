import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldMetaProps, WrappedFieldProps } from 'redux-form';
import TimePicker, { TimePickerProps } from 'rc-time-picker';
import moment from 'moment-timezone';
import { Callout, Intent, Overlay } from '@blueprintjs/core';
import { DayPickerSingleDateController, DayPickerSingleDateControllerShape } from 'react-dates';

import { FieldWrapper } from './FieldWrapper';
import './DateTimeField.sass';

export interface DateTimeFieldProps extends BaseFieldProps {
  readonly label?: string | React.ReactElement;
  readonly className?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly datePickerProps?: Partial<DayPickerSingleDateControllerShape>;
  readonly minDate?: moment.Moment;
  readonly maxDate?: moment.Moment;
  readonly timePicker?: Omit<TimePickerProps, 'value' | 'onChange' | 'disabled' | 'allowEmpty' | 'showSecond'>;
  readonly renderClearButton?: React.ComponentType<{ value: any; onClear: () => void }>;
}

type StateProps = {
  isFocused: boolean | null;
}

export const Errors: React.FunctionComponent<WrappedFieldMetaProps> = ({ error, warning }) => {
  if (error) return <Callout intent={Intent.DANGER}>{error}</Callout>;

  if (warning) return <Callout intent={Intent.WARNING}>{warning}</Callout>;

  return null;
};

class DateTimePicker extends React.PureComponent<WrappedFieldProps & DateTimeFieldProps, StateProps> {
  state = {
    isFocused: false,
  };

  triggerBlur = (date: moment.Moment): void => this.props.input.onChange(date);

  triggerChange = (date: moment.Moment | null): void => {
    if (this.props.disabled) return;

    this.props.input.onChange(date);
    this.props.input.onBlur(date);
  };

  handleDateChange = (date: moment.Moment | null): void => {
    // react-dates set the hours/minutes to be 12:00 so we ignore them
    let newDate = date?.clone();

    if (this.props.input.value && newDate) {
      newDate.set('hours', this.props.input.value.get('hours'));
      newDate.set('minutes', this.props.input.value.get('minutes'));
      newDate.set('seconds', this.props.input.value.get('seconds'));
      newDate.set('milliseconds', this.props.input.value.get('milliseconds'));
    }

    this.triggerChange(newDate || null);
  };

  handleTimeChange = (date: moment.Moment): void => {
    // if we don't have a date, don't do anything, shouldn't be triggered
    if (!this.props.input.value) {
      return;
    }

    this.triggerChange(date);
  };

  handleClear = () => this.handleDateChange(null);

  handleFocusChange = (arg: { focused: boolean | null }) => this.setState({ isFocused: arg.focused || false });

  isDayBlocked = (day: moment.Moment) => {
    if (this.props.minDate && this.props.minDate.isAfter(day)) {
      return true;
    }

    if (this.props.maxDate && this.props.maxDate.isBefore(day)) {
      return true;
    }

    return false;
  };

  renderInfoPanel = (clear?: JSX.Element) => (
    <div>
      {this.props.timePicker && <TimePicker
        {...this.props.timePicker}
        allowEmpty={!!this.props.renderClearButton}
        disabled={this.props.disabled}
        value={this.props.input.value}
        onChange={this.handleTimeChange}
        className={`date-time-field-time-picker ${this.props.timePicker?.className || ''}`}
        showSecond={false}
      />}
      {clear}
    </div>
  );

  render() {
    const {
      meta,
      label,
      required,
      datePickerProps,
      input,
      disabled,
      renderClearButton: ClearButton,
      className,
    } = this.props;

    return (
      <FieldWrapper
        meta={meta}
        label={label}
        required={required}
        hideErrors
        className={`date-time-field ${className || ''}`}
      >
        <div className="date-time-field_content">
          <DayPickerSingleDateController
            hideKeyboardShortcutsPanel
            isDayBlocked={this.isDayBlocked}
            // if we make the function below part of the class body the timepicker sometimes
            // doesn't rerender properly, presumably due to daypickersingledatecontroller's
            // shouldComponentUpdate. We're passing a new function each render just to make
            // sure it can rerender properly
            renderCalendarInfo={() => this.renderInfoPanel(ClearButton && <ClearButton value={input?.value} onClear={this.handleClear} />)}
            calendarInfoPosition="bottom"
            {...datePickerProps}
            date={input.value || null}
            onDateChange={this.handleDateChange}
            focused={this.state.isFocused}
            onFocusChange={this.handleFocusChange}
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

export const DateTimeField: React.FunctionComponent<DateTimeFieldProps> = props => (
  <Field {...props} component={DateTimePicker} />
);
