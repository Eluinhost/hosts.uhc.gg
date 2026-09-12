import React from 'react';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getDetailsDateTimeFormat, getTimezone } from '../../state/Selectors';

type Props = {
  readonly time: moment.Moment;
};

type StateSlice = {
  readonly format: string;
  readonly timezone: string;
};

const stateSelector = createSelector<ApplicationState, string, string, StateSlice>(
  getDetailsDateTimeFormat,
  getTimezone,
  (format, timezone) => ({
    format,
    timezone,
  }),
);

export const MatchOpens: React.ComponentType<Props> = React.memo(({ time }: Props) => {
  const { format, timezone } = useSelector(stateSelector);
  return <span className="match-time">{time.clone().tz(timezone).format(format)}</span>;
});
