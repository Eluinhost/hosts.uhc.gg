import { Button, Tooltip } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { atom, useAtomValue } from 'jotai';
import React, { useEffect, useMemo, useState } from 'react';

import { is12hAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';
import dayjs from '../../dayjs';
import { TimeData } from '../api';

import styles from './CurrentTime.module.css';

const MILLIS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * SECONDS_PER_MINUTE;
const MINUTES_PER_HOUR = 60;
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * MINUTES_PER_HOUR;

const formatOffset = (offset: number): string => {
  let o = offset;
  const negative = o < 0;

  let output = '';

  if (negative) {
    output = '-';
    o *= -1;
  }

  if (o > MILLIS_PER_HOUR) {
    output += `${Math.floor(o / MILLIS_PER_HOUR)}h `;
    o %= MILLIS_PER_HOUR;
  }

  if (o > MILLIS_PER_MINUTE) {
    output += `${Math.floor(o / MILLIS_PER_MINUTE)}m `;
    o %= MILLIS_PER_MINUTE;
  }

  const display: number = offset < 10 * MILLIS_PER_SECOND ? o / MILLIS_PER_SECOND : Math.floor(o / MILLIS_PER_SECOND);

  output += `${display}s `;

  return output.trim();
};

const currentTimeFormatAtom = atom(get => (get(is12hAtom) ? 'hh:mm:ss A z' : 'HH:mm:ss z'));

export const CurrentTime: React.FC = () => {
  const { data: offset, refetch: resync, isPending: unsynced } = useQuery(TimeData.serverOffset);
  const timezone = useAtomValue(timezoneAtom);
  const format = useAtomValue(currentTimeFormatAtom);

  const [time, setTime] = useState(() => dayjs.utc());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTime(dayjs.utc());
    }, 1000);
    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const formattedOffset = useMemo(() => formatOffset(offset ?? 0), [offset]);

  const tooltipText = useMemo(
    () =>
      unsynced
        ? 'Not synced with the server'
        : `Synced with the server with ${formattedOffset} offset. Click to resync`,
    [formattedOffset, unsynced],
  );

  const timeText = useMemo(
    () =>
      time
        .add(offset ?? 0, 'milliseconds')
        .tz(timezone)
        .format(format),
    [time, offset, timezone, format],
  );

  return (
    <Tooltip label={tooltipText} position="bottom">
      <Button
        variant="subtle"
        size="lg"
        p="xs"
        m={0}
        className={clsx({
          [styles.currentTime]: true,
          [styles.unsynced]: offset === undefined,
        })}
        onClick={() => {
          void resync();
        }}
      >
        {timeText}
      </Button>
    </Tooltip>
  );
};
