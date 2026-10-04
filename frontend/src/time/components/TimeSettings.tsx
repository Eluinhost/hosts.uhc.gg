import { ActionIcon, Button, Group, Space, Paper, Cascader, type CascaderOption } from '@mantine/core';
import { CaretLeftIcon, ClockIcon, GearIcon } from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import React, { useState } from 'react';

import { is12hAtom } from '@/atoms/timeFormatting';
import { timezoneAtom } from '@/atoms/timezone';
import { CurrentTime } from '@/time/components/CurrentTime';
import styles from '@/time/components/TimeSettings.module.css';

const convertTzs = (tzs: string[]): Array<CascaderOption> => {
  const root: Array<CascaderOption> = [];

  for (const tz of tzs) {
    const segments = tz.split('/');
    let level = root;

    for (const segment of segments) {
      let node = level.find(o => o.value === segment);

      if (!node) {
        node = {
          value: segment,
          label: segment.replaceAll('_', ' '),
          children: [],
        };
        level.push(node);
      }

      level = node.children ?? [];
    }
  }

  return root;
};

const cascaderOptions = convertTzs(Intl.supportedValuesOf('timeZone'));

export const TimeSettings: React.FC = () => {
  const [timezone, setTimezone] = useAtom(timezoneAtom);
  const [is12h, setIs12h] = useAtom(is12hAtom);
  const [open, setOpen] = useState(false);

  return (
    <Paper className={styles.timeSettings} bdrs="0" shadow="xs" component={Group} align="center">
      <Group flex={1} justify="flex-start" align="center" gap="xs">
        <ActionIcon
          size="md"
          ml="md"
          bdrs={100}
          variant="subtle"
          onClick={() => {
            setOpen(prev => !prev);
          }}
        >
          {open ? <CaretLeftIcon /> : <GearIcon />}
        </ActionIcon>
        {open && (
          <Button
            leftSection={<ClockIcon />}
            variant="subtle"
            size="compact-sm"
            onClick={() => {
              setIs12h(!is12h);
            }}
          >
            {is12h ? '12h' : '24h'}
          </Button>
        )}
        {open && (
          <Cascader
            searchable
            allowDeselect={false}
            data={cascaderOptions}
            value={timezone.split('/')}
            onChange={value => {
              if (value) {
                setTimezone(value.join('/'));
              }
            }}
            comboboxProps={{ width: 'max-content' }}
          />
        )}
      </Group>
      <Group flex={1} justify="center" align="center">
        <CurrentTime />
      </Group>
      <Space flex={1} />
    </Paper>
  );
};
