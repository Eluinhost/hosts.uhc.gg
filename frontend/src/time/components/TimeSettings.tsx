import { ActionIcon, Button, Group, Space, ComboboxPopover } from '@mantine/core';
import { CaretRightIcon, CaretUpDownIcon, ClockIcon, GearIcon } from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import React, { useState } from 'react';

import { is12hAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';

import { CurrentTime } from './CurrentTime';
import styles from './TimeSettings.module.css';

const tzs = Intl.supportedValuesOf('timeZone');

export const TimeSettings: React.FC = () => {
  const [timezone, setTimezone] = useAtom(timezoneAtom);
  const [is12h, setIs12h] = useAtom(is12hAtom);
  const [open, setOpen] = useState(false);

  return (
    <Group align="center" className={styles.timeSettings}>
      <Space flex={1} />
      <Group flex={1} justify="center" align="center">
        <CurrentTime />
      </Group>
      <Group flex={1} justify="flex-end" align="center" gap="xs">
        {open && (
          <Button
            leftSection={<ClockIcon />}
            variant="subtle"
            size="sm"
            onClick={() => {
              setIs12h(!is12h);
            }}
          >
            {is12h ? '12h' : '24h'}
          </Button>
        )}
        {open && (
          <ComboboxPopover
            data={tzs}
            value={timezone}
            onChange={tz => {
              if (tz) {
                setTimezone(tz);
              }
            }}
            searchable
            nothingFoundMessage="No items found."
          >
            <ComboboxPopover.Target>
              <Button variant="subtle" size="sm" rightSection={<CaretUpDownIcon />}>
                {timezone}
              </Button>
            </ComboboxPopover.Target>
          </ComboboxPopover>
        )}
        <ActionIcon
          size="lg"
          variant="subtle"
          onClick={() => {
            setOpen(prev => !prev);
          }}
        >
          {open ? <CaretRightIcon /> : <GearIcon />}
        </ActionIcon>
      </Group>
    </Group>
  );
};
