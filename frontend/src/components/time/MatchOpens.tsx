import * as React from 'react';
import moment from 'moment-timezone';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getDetailsDateTimeFormat, getTimezone } from '../../state/Selectors';
import { connect } from 'react-redux';
import { always } from 'ramda';

type Props = {
  readonly time: moment.Moment;
};

type StateProps = {
  readonly format: string;
  readonly timezone: string;
};

const MatchOpensComponent: React.FunctionComponent<Props & StateProps> = ({ time, timezone, format }) => (
  <span className="match-time">
    {time.clone().tz(timezone).format(format)}
  </span>
);

const stateSelector = createSelector<ApplicationState, string, string, StateProps>(
  getDetailsDateTimeFormat,
  getTimezone,
  (format, timezone) => ({
    format,
    timezone,
  }),
);

export const MatchOpens: React.ComponentType<Props> = connect<StateProps, {}, Props>(stateSelector, always({}))(
  MatchOpensComponent,
);
