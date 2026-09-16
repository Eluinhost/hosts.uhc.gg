import { Callout, Intent, Overlay2 } from '@blueprintjs/core';
import RcPicker, { PickerPanel, type PickerPanelProps, type PickerProps } from '@rc-component/picker';
import generateDayjsConfig from '@rc-component/picker/lib/generate/dayjs';
import enGB from '@rc-component/picker/lib/locale/en_GB';
import React, { useCallback } from 'react';
import { type BaseFieldProps, Field, type WrappedFieldMetaProps, type WrappedFieldProps } from 'redux-form';

import type { Dayjs } from '../../dayjs';

import { FieldWrapper } from './FieldWrapper';
import './DateTimeField.sass';

export interface DateTimeFieldProps extends BaseFieldProps {
  readonly label?: string | React.ReactElement;
  readonly className?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly datePickerProps?: Partial<PickerPanelProps>;
  readonly minDate?: Dayjs;
  readonly maxDate?: Dayjs;
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
  const value = input.value as Dayjs | undefined;

  const triggerChange = useCallback(
    (date: Dayjs | null): void => {
      if (disabled) return;

      onChange(date);
      onBlur(date);
    },
    [disabled, onChange, onBlur],
  );

  const handleDateChange = useCallback(
    (date: Dayjs | null): void => {
      const newDate = date?.utc();

      if (value && newDate) {
        triggerChange(
          newDate
            .set('hour', value.hour())
            .set('minute', value.minute())
            .set('second', value.second())
            .set('millisecond', value.millisecond()),
        );
        return;
      }

      triggerChange(newDate || null);
    },
    [value, triggerChange],
  );

  const handleTimeChange = useCallback(
    (date: Dayjs): void => {
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
    (day: Dayjs) => {
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
          generateConfig={generateDayjsConfig}
          value={value || null}
          onChange={date => {
            handleDateChange(date as Dayjs | null);
          }}
          disabledDate={isDayBlocked}
          {...datePickerProps}
        />
        {timePicker && (
          <RcPicker
            picker="time"
            showTime
            locale={enGB}
            generateConfig={generateDayjsConfig}
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
