import { Intent, Tag, type TagProps } from '@blueprintjs/core';
import { TimeIcon } from '@blueprintjs/icons';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';

import dayjs, { type Dayjs } from '../../dayjs';
import { TimeData } from '../api';

export type TimeFromNowTagProps = {
  time: Dayjs;
  hideSuffix?: boolean;
} & TagProps;

export const TimeFromNowTag: React.FC<TimeFromNowTagProps> = ({ time, hideSuffix, ...props }) => {
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

    let intent: Intent = Intent.SUCCESS;
    const diff = time.diff(now, 'minutes');

    if (diff < 0) {
      intent = Intent.WARNING;
    }

    if (diff < -30) {
      intent = Intent.DANGER;
    }

    return { text, intent };
  }, [time, currentTime, offset, hideSuffix]);

  return (
    <Tag {...props} intent={intent}>
      <TimeIcon /> {text}
    </Tag>
  );
};
