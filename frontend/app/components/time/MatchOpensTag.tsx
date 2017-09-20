import { Intent, Tag } from '@blueprintjs/core';
import * as React from 'react';
import * as moment from 'moment-timezone';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';
import { connect } from 'react-redux';
import { always } from 'ramda';

type Props = {
  readonly opens: moment.Moment;
  readonly created: moment.Moment;
};

type StateProps = {
  readonly format: string;
  readonly timezone: string;
};

const MatchOpensTagComponent: React.SFC<Props & StateProps> = ({ opens, created, format, timezone }) => (
  <Tag
    intent={Intent.SUCCESS}
    className="pt-large match-opens"
    title={`Created @ ${created.clone().tz(timezone).format(format)}`}
  >
    {opens.clone().tz(timezone).format(format)}
  </Tag>
);

const stateSelector = createSelector<ApplicationState, string, string, StateProps>(
  getTagDateTimeFormat,
  getTimezone,
  (format, timezone) => ({
    format,
    timezone,
  }),
);

export const MatchOpensTag: React.ComponentClass<Props> = connect<StateProps, {}, Props>(
  stateSelector,
  always({}),
)(MatchOpensTagComponent);
