import React from 'react';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { getDetailsDateTimeFormat, getTimezone } from '../../state/Selectors';

type Props = {
  readonly time: moment.Moment;
};

const stateSelector = createSelector(getDetailsDateTimeFormat, getTimezone, (format, timezone) => ({
  format,
  timezone,
}));

export const MatchOpens: React.FC<Props> = ({ time }) => {
  const { format, timezone } = useSelector(stateSelector);
  return <span className="match-time">{time.clone().tz(timezone).format(format)}</span>;
};
