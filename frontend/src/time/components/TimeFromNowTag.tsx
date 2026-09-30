import { Badge, type MantineColor } from '@mantine/core';
import { ClockIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';

import dayjs, { type Dayjs } from '@/dayjs';
import { TimeData } from '@/time/api';

export type TimeFromNowTagProps = {
  time: Dayjs;
  hideSuffix?: boolean;
  title?: string;
};

export const TimeFromNowTag: React.FC<TimeFromNowTagProps> = ({ time, hideSuffix, title }) => {
  const { data: offset } = useQuery(TimeData.serverOffset);
  const [currentTime, setCurrentTime] = useState(dayjs.utc());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(dayjs.utc());
    }, 2000);
    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const { text, intent } = useMemo(() => {
    const now = currentTime.add(offset ?? 0, 'milliseconds');
    const text = time.from(now, hideSuffix);

    let intent: MantineColor = 'green';
    const diff = time.diff(now, 'minutes');

    if (diff < 0) {
      intent = 'yellow';
    }

    if (diff < -30) {
      intent = 'red';
    }

    return { text, intent };
  }, [time, currentTime, offset, hideSuffix]);

  return (
    <Badge size="lg" bdrs="sm" color={intent} leftSection={<ClockIcon />} title={title}>
      {text}
    </Badge>
  );
};
