import { Callout, Intent } from '@blueprintjs/core';
import { InfoIcon, WarningIcon } from '@phosphor-icons/react';
import { PickerPanel, type PickerPanelProps } from '@rc-component/picker';
import generateDayjsConfig from '@rc-component/picker/lib/generate/dayjs';
import enGB from '@rc-component/picker/lib/locale/en_GB';
import { type FieldWithValue } from '@tanstack/react-form';
import { useAtomValue } from 'jotai';
import React, { useCallback } from 'react';

import { is12hAtom, timeFormatAtom } from '../../atoms/timeFormatting';
import type { Dayjs } from '../../dayjs';

import './DateTimeField.sass';

export type DateTimeFieldProps = Omit<
  PickerPanelProps<Dayjs>,
  | 'picker'
  | 'locale'
  | 'generateConfig'
  | 'value'
  | 'onPickerValueChange'
  | 'disabledDate'
  | 'showTime'
  | 'showSecond'
  | 'minuteStep'
  | 'use12Hours'
  | 'showNow'
> & {
  field: FieldWithValue<Dayjs>;
  disabled?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
};

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  disabled,
  minDate,
  maxDate,
  field,
  ...datePickerProps
}) => {
  const is12h = useAtomValue(is12hAtom);
  const format = useAtomValue(timeFormatAtom);

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

  return (
    <div className="date-time-field">
      <span className="date-time-field-preview">{field.value.format(`ddd D MMM - ${format}`)}</span>
      <PickerPanel
        {...datePickerProps}
        picker="date"
        locale={enGB}
        generateConfig={generateDayjsConfig}
        value={field.value}
        onPickerValueChange={day => {
          if (!disabled) {
            field.handleChange(day);
          }
        }}
        disabledDate={isDayBlocked}
        showTime
        showSecond={false}
        minuteStep={15}
        use12Hours={is12h}
        showNow
      />
      {field.meta.isInvalid && (
        <Callout intent={Intent.DANGER} icon={false}>
          <WarningIcon />
          <span>{field.meta.errors.map(x => x.message).join(', ')}</span>
        </Callout>
      )}
      <Callout intent={Intent.PRIMARY} icon={false}>
        <InfoIcon />
        <span>All times must be entered in your chosen timezone</span>
        <strong> ({field.value.format('zzz / Z')})</strong>
      </Callout>
    </div>
  );
};
