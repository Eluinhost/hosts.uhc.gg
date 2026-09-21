import { Tooltip, Position } from '@blueprintjs/core';
import { memoizeWith, toString } from 'ramda';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import { SyncTime } from '../../actions';
import dayjs from '../../dayjs';
import type { ApplicationState } from '../../state/ApplicationState';
import { getTimezone, is12hFormat } from '../../state/Selectors';

const MILLIS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * SECONDS_PER_MINUTE;
const MINUTES_PER_HOUR = 60;
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * MINUTES_PER_HOUR;

const formatOffset = memoizeWith(toString, (offset: number): string => {
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
});

const stateSelector = createSelector(
  (state: ApplicationState) => state.timeSync,
  is12hFormat,
  getTimezone,
  (timeSync, is12h, timezone) => ({
    timeSync,
    timezone,
    timeFormat: is12h ? 'hh:mm:ss A z' : 'HH:mm:ss z',
  }),
);

export const CurrentTime: React.FC = () => {
  const { timeSync, timezone, timeFormat } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const [time, setTime] = useState(() => dayjs.utc());

  const resync = useCallback(() => dispatch(SyncTime.start()), [dispatch]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTime(dayjs.utc());
    }, 1000);
    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const tooltipText = useMemo(
    () =>
      timeSync.synced
        ? `Synced with the server with ${formatOffset(timeSync.offset)} offset. Click to resync`
        : 'Not synced with the server',
    [timeSync],
  );

  const timeText = useMemo(
    () => time.add(timeSync.offset, 'milliseconds').tz(timezone).format(timeFormat),
    [time, timeSync.offset, timezone, timeFormat],
  );

  return (
    <Tooltip content={tooltipText} position={Position.BOTTOM}>
      <span
        role="button"
        tabIndex={0}
        className={`current-time ${timeSync.synced ? '' : 'current-time-unsynced'}`}
        onClick={resync}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            resync();
          }
        }}
      >
        {timeText}
      </span>
    </Tooltip>
  );
};
