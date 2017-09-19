import * as React from 'react';
import * as moment from 'moment';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getDetailsDateTimeFormat } from '../../state/Selectors';
import { connect } from 'react-redux';
import { always } from 'ramda';

type Props = {
  readonly time: moment.Moment;
};

type StateProps = {
  readonly format: string;
};

const MatchOpensComponent: React.SFC<Props & StateProps> = ({ time, format }) => (
  <span className="match-time">{time.format(format)}</span>
);

const stateSelector = createSelector<ApplicationState, string, StateProps>(
  getDetailsDateTimeFormat,
  format => ({
    format,
  }),
);

export const MatchOpens: React.ComponentClass<Props> = connect<StateProps, {}, Props>(
  stateSelector,
  always({}),
)(MatchOpensComponent);
