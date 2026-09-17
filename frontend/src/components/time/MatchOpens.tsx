import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import type { Dayjs } from '../../dayjs';
import { getDetailsDateTimeFormat, getTimezone } from '../../state/Selectors';

type Props = {
  readonly time: Dayjs;
};

const stateSelector = createSelector(getDetailsDateTimeFormat, getTimezone, (format, timezone) => ({
  format,
  timezone,
}));

export const MatchOpens: React.FC<Props> = ({ time }) => {
  const { format, timezone } = useSelector(stateSelector);
  return <span className="match-time">{time.tz(timezone).format(format)}</span>;
};
