import { ActionIcon, Group, Space, Paper, Cascader, type CascaderOption, Switch, useMatches } from '@mantine/core';
import { CaretLeftIcon, ClockIcon, GearIcon } from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import React, { useState } from 'react';

import { is12hAtom } from '@/atoms/timeFormatting';
import { SUPPORTED_TIMEZONES, timezoneAtom, TRIGGER_AUTO_DETECTION } from '@/atoms/timezone';
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
          label: segment === 'Etc' ? 'GMT Offsets' : segment.replaceAll('_', ' '),
          children: [],
        };
        level.push(node);
      }

      level = node.children ?? [];
    }
  }

  return [...root, { value: TRIGGER_AUTO_DETECTION, label: 'Auto-detect', children: [] }];
};

const cascaderOptions = convertTzs(SUPPORTED_TIMEZONES);

export const TimeSettings: React.FC = () => {
  const [timezone, setTimezone] = useAtom(timezoneAtom);
  const [is12h, setIs12h] = useAtom(is12hAtom);
  const [open, setOpen] = useState(false);

  const timezoneColumns = useMatches({ base: 2, sm: 3 });

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
          <Cascader
            searchable
            maxDisplayedLevels={timezoneColumns}
            maxDropdownHeight={450}
            expandTrigger="hover"
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
        {open && (
          <Switch
            thumbIcon={<ClockIcon color="var(--mantine-color-gray-7)" />}
            withThumbIndicator={false}
            onLabel="24h"
            offLabel="12h"
            radius="md"
            color="green"
            onChange={value => {
              setIs12h(!value.target.checked);
            }}
            checked={!is12h}
            size="xl"
            classNames={{
              trackLabel: styles.is12hLabel,
            }}
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
