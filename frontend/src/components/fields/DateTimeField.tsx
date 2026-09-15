import { Callout, Intent, Overlay2 } from '@blueprintjs/core';
import RcPicker, { PickerPanel, type PickerPanelProps, type PickerProps } from '@rc-component/picker';
import generateMomentConfig from '@rc-component/picker/lib/generate/moment';
import enGB from '@rc-component/picker/lib/locale/en_GB';
import moment from 'moment-timezone';
import React, { useCallback } from 'react';
import { type BaseFieldProps, Field, type WrappedFieldMetaProps, type WrappedFieldProps } from 'redux-form';

import { FieldWrapper } from './FieldWrapper';
import './DateTimeField.sass';

export interface DateTimeFieldProps extends BaseFieldProps {
  readonly label?: string | React.ReactElement;
  readonly className?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly datePickerProps?: Partial<PickerPanelProps>;
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

  const getPopupContainer = useCallback((node: HTMLElement): HTMLElement => {
    return node.closest('.date-time-field') ?? node.parentElement ?? document.body;
  }, []);

  return (
    <FieldWrapper
      meta={meta}
      label={label}
      required={required}
      hideErrors
      className={`date-time-field ${className || ''}`}
    >
      <div className="date-time-field_content">
        <PickerPanel
          picker="date"
          locale={enGB}
          generateConfig={generateMomentConfig}
          value={value || null}
          onChange={date => {
            handleDateChange(date as moment.Moment | null);
          }}
          disabledDate={isDayBlocked}
          {...datePickerProps}
        />
        {timePicker && (
          <RcPicker
            picker="time"
            showTime
            locale={enGB}
            generateConfig={generateMomentConfig}
            getPopupContainer={getPopupContainer}
            allowClear={!!ClearButton}
            disabled={disabled}
            value={value}
            onPickerValueChange={handleTimeChange}
            className={`date-time-field-time-picker ${timePicker.className || ''}`}
            showSecond={false}
            {...timePicker}
          />
        )}
        {ClearButton && <ClearButton value={value} onClear={handleClear} />}
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
