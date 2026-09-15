import { Intent, Tag } from '@blueprintjs/core';
import moment from 'moment-timezone';
import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';

type Props = {
  readonly opens: moment.Moment;
  readonly created: moment.Moment;
};

const stateSelector = createSelector(getTagDateTimeFormat, getTimezone, (format, timezone) => ({
  format,
  timezone,
}));

export const MatchOpensTag: React.FC<Props> = ({ opens, created }) => {
  const { format, timezone } = useSelector(stateSelector);

  return (
    <Tag
      intent={Intent.SUCCESS}
      size="large"
      className="match-opens"
      title={`Created @ ${created.clone().tz(timezone).format(format)}`}
    >
      {opens.clone().tz(timezone).format(format)}
    </Tag>
  );
};
