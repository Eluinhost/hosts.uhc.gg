import { Callout, Intent, Overlay2 } from '@blueprintjs/core';
import moment from 'moment-timezone';
import Picker, { PickerProps } from 'rc-picker';
import generateMomentConfig from 'rc-picker/lib/generate/moment';
import enGB from 'rc-picker/lib/locale/en_GB';
import React, { useCallback, useState } from 'react';
import { DayPickerSingleDateController, DayPickerSingleDateControllerShape } from 'react-dates';
import { BaseFieldProps, Field, WrappedFieldMetaProps, WrappedFieldProps } from 'redux-form';

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
  readonly timePicker?: Pick<PickerProps, 'minuteStep' | 'use12Hours' | 'className'>;
  readonly renderClearButton?: React.ComponentType<{ value: unknown; onClear: () => void }>;
}

export const Errors: React.FC<WrappedFieldMetaProps> = ({ error, warning }) => {
  if (error) return <Callout intent={Intent.DANGER}>{error}</Callout>;

  if (warning) return <Callout intent={Intent.WARNING}>{warning}</Callout>;

  return null;
};

const DateTimePicker: React.FC<WrappedFieldProps & DateTimeFieldProps> = props => {
  const {
    meta,
    label,
    required,
    datePickerProps,
    input,
    disabled,
    renderClearButton: ClearButton,
    className,
    minDate,
    maxDate,
    timePicker,
  } = props;
  const { onChange, onBlur } = input;
  const value = input.value as moment.Moment | undefined;

  const [isFocused, setIsFocused] = useState(false);

  const triggerChange = useCallback(
    (date: moment.Moment | null): void => {
      if (disabled) return;

      onChange(date);
      onBlur(date);
    },
    [disabled, onChange, onBlur],
  );

  const handleDateChange = useCallback(
    (date: moment.Moment | null): void => {
      // react-dates set the hours/minutes to be 12:00 so we ignore them
      const newDate = date?.utc().clone();

      if (value && newDate) {
        newDate.set('hours', value.get('hours'));
        newDate.set('minutes', value.get('minutes'));
        newDate.set('seconds', value.get('seconds'));
        newDate.set('milliseconds', value.get('milliseconds'));
      }

      triggerChange(newDate || null);
    },
    [value, triggerChange],
  );

  const handleTimeChange = useCallback(
    (date: moment.Moment): void => {
      // if we don't have a date, don't do anything, shouldn't be triggered
      if (!value) {
        return;
      }

      triggerChange(date);
    },
    [value, triggerChange],
  );

  const handleClear = useCallback(() => {
    handleDateChange(null);
  }, [handleDateChange]);

  const handleFocusChange = useCallback((arg: { focused: boolean | null }) => {
    setIsFocused(arg.focused || false);
  }, []);

  const isDayBlocked = useCallback(
    (day: moment.Moment) => {
      if (minDate && minDate.isAfter(day)) {
        return true;
      }

      if (maxDate && maxDate.isBefore(day)) {
        return true;
      }

      return false;
    },
    [minDate, maxDate],
  );

  const renderInfoPanel = (clear?: React.ReactNode) => (
    <div>
      {timePicker && (
        <Picker
          picker="time"
          showTime
          locale={enGB}
          generateConfig={generateMomentConfig}
          allowClear={!!ClearButton}
          disabled={disabled}
          value={value}
          onPickerValueChange={handleTimeChange}
          className={`date-time-field-time-picker ${timePicker.className || ''}`}
          showSecond={false}
          {...timePicker}
        />
      )}
      {clear}
    </div>
  );

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
          isDayBlocked={isDayBlocked}
          initialVisibleMonth={value ? () => value : null}
          // if we make the function below part of the class body the timepicker sometimes
          // doesn't rerender properly, presumably due to daypickersingledatecontroller's
          // shouldComponentUpdate. We're passing a new function each render just to make
          // sure it can rerender properly
          renderCalendarInfo={() => renderInfoPanel(ClearButton && <ClearButton value={value} onClear={handleClear} />)}
          calendarInfoPosition="bottom"
          {...datePickerProps}
          date={value || null}
          onDateChange={handleDateChange}
          focused={isFocused}
          onFocusChange={handleFocusChange}
        />
        <Errors {...meta} />
      </div>
      <Overlay2
        hasBackdrop
        isOpen={!!disabled}
        usePortal={false}
        autoFocus={false}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <div />
      </Overlay2>
    </FieldWrapper>
  );
};

export const DateTimeField: React.FC<DateTimeFieldProps> = props => <Field {...props} component={DateTimePicker} />;
