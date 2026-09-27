import { Alert, Button, Indicator, Modal, Stack, Text } from '@mantine/core';
import { type DatePickerProps, InlineDateTimePicker, type InlineDateTimePickerProps } from '@mantine/dates';
import { ClockIcon, InfoIcon, WarningIcon } from '@phosphor-icons/react';
import { type FieldWithValue } from '@tanstack/react-form';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { isDarkModeAtom } from '../../atoms/isDarkMode';
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

const dayRenderer: DatePickerProps['renderDay'] = date => {
  const parsed = dayjs(date);

  const isToday = dayjs().isSame(parsed, 'day');

  return (
    <Indicator size={6} color="red" offset={-5} disabled={!isToday}>
      <div>{parsed.date()}</div>
    </Indicator>
  );
};

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  minDate,
  maxDate,
  field,
  timePickerProps,
  submitButtonProps,
  ...datePickerProps
}) => {
  const is12h = useAtomValue(is12hAtom);
  const isDarkMode = useAtomValue(isDarkModeAtom);
  const format = useAtomValue(timeFormatAtom);
  const timezone = useAtomValue(timezoneAtom);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Stack mb="md" justify="center" align="stretch">
      <Button
        size="xl"
        variant="gradient"
        gradient={
          isDarkMode
            ? {
                from: 'red',
                to: 'yellow',
              }
            : {
                from: 'green',
                to: 'blue',
              }
        }
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Text size="xl" fw={700}>
          {field.value.format(`ddd D MMM - ${format}`)}
        </Text>
      </Button>
      <Modal
        centered
        opened={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        size="xl"
      >
        <InlineDateTimePicker
          numberOfColumns={2}
          fullWidth
          size="lg"
          maxLevel="month"
          monthLabelFormat="MMMM"
          maxDate={maxDate?.format('YYYY-MM-DD')}
          minDate={minDate?.format('YYYY-MM-DD')}
          {...datePickerProps}
          renderDay={dayRenderer}
          value={field.value.format('YYYY-MM-DD HH:mm:ss')}
          onChange={value => {
            field.handleChange(dayjs.tz(value, timezone));
          }}
          onSubmit={() => {
            setIsOpen(false);
          }}
          timePickerProps={{
            format: is12h ? '12h' : '24h',
            leftSection: <ClockIcon size={16} />,
            withDropdown: true,
            ...timePickerProps,
          }}
          submitButtonProps={{
            variant: 'filled',
            color: 'green',
            ...submitButtonProps,
          }}
        />
        <Alert color="blue" icon={false} mt="sm">
          <InfoIcon />
          <span>All times must be entered in your chosen timezone</span>
          <strong> ({field.value.format('zzz / Z')})</strong>
        </Alert>
      </Modal>
      {field.meta.isInvalid && (
        <Alert color="red" icon={false}>
          <WarningIcon />
          <span>{field.meta.errors.map(x => x.message).join(', ')}</span>
        </Alert>
      )}
    </Stack>
  );
};
