import { Intent, Tag } from '@blueprintjs/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import type { Dayjs } from '../../dayjs';
import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';

type Props = {
  readonly opens: Dayjs;
  readonly created: Dayjs;
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
      title={`Created @ ${created.tz(timezone).format(format)}`}
    >
      {opens.tz(timezone).format(format)}
    </Tag>
  );
};
