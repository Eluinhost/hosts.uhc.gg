import { Alert, Group, Stack, Text } from '@mantine/core';
import { type InlineDateTimePickerProps, MiniCalendar, TimePicker } from '@mantine/dates';
import { ClockIcon, InfoIcon, WarningIcon } from '@phosphor-icons/react';
import { type FieldWithValue } from '@tanstack/react-form';
import { useAtomValue } from 'jotai';
import React from 'react';

import { is12hAtom, timeFormatAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';
import dayjs from '../../dayjs';
import type { Dayjs } from '../../dayjs';

import '@mantine/dates/styles.css';

export type DateTimeFieldProps = Omit<
  InlineDateTimePickerProps,
  'value' | 'onChange' | 'maxDate' | 'minDate' | 'classNames' | 'onSubmit' | 'renderDay'
> & {
  field: FieldWithValue<Dayjs>;
  minDate?: Dayjs;
  maxDate?: Dayjs;
};

export const DateTimeField: React.FC<DateTimeFieldProps> = ({ minDate, maxDate, field, timePickerProps }) => {
  const is12h = useAtomValue(is12hAtom);
  const format = useAtomValue(timeFormatAtom);
  const timezone = useAtomValue(timezoneAtom);

  return (
    <Stack justify="center" align="stretch">
      <Group justify="center">
        <Text size="xl" fw={700}>
          {field.value.format(`ddd D MMM - ${format}`)}
        </Text>
      </Group>
      <Group wrap="wrap" align="center">
        <MiniCalendar
          size="xl"
          value={field.value.format('YYYY-MM-DD')}
          onChange={date => {
            const parsed = dayjs(date);

            field.handleChange(prev => prev.year(parsed.year()).month(parsed.month()).date(parsed.date()));
          }}
          numberOfDays={7}
          minDate={minDate?.format('YYYY-MM-DD')}
          maxDate={maxDate?.format('YYYY-MM-DD')}
        />
        <TimePicker
          size="lg"
          flex={1}
          value={field.value.format('HH:mm:ss')}
          onChange={value => {
            console.log(value);
            field.handleChange(prev => dayjs.tz(prev.format('YYYY-MM-DD') + ' ' + value, timezone));
          }}
          format={is12h ? '12h' : '24h'}
          leftSection={<ClockIcon size={16} />}
          withDropdown
          {...timePickerProps}
        />
      </Group>
      <Alert color="blue" icon={<InfoIcon />}>
        <span>All times must be entered in your chosen timezone</span>
        <strong> ({field.value.format('zzz / Z')})</strong>
      </Alert>
      {field.meta.isInvalid && (
        <Alert color="red" icon={<WarningIcon />}>
          <span>{field.meta.errors.map(x => x.message).join(', ')}</span>
        </Alert>
      )}
    </Stack>
  );
};
