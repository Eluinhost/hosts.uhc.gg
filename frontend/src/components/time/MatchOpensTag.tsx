import React from 'react';
import { Intent, Tag } from '@blueprintjs/core';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';

type Props = {
  readonly opens: moment.Moment;
  readonly created: moment.Moment;
};

type StateSlice = {
  readonly format: string;
  readonly timezone: string;
};

const stateSelector = createSelector<ApplicationState, string, string, StateSlice>(
  getTagDateTimeFormat,
  getTimezone,
  (format, timezone) => ({
    format,
    timezone,
  }),
);

export const MatchOpensTag: React.ComponentType<Props> = React.memo(({ opens, created }: Props) => {
  const { format, timezone } = useSelector(stateSelector);

  return (
    <Tag
      intent={Intent.SUCCESS}
      large
      className="match-opens"
      title={`Created @ ${created.clone().tz(timezone).format(format)}`}
    >
      {opens.clone().tz(timezone).format(format)}
    </Tag>
  );
});
