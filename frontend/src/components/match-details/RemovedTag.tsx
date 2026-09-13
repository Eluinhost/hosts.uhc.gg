import { Classes, Intent, Tag } from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import React from 'react';
import { useSelector } from 'react-redux';

import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';
import { Match } from '../../models/Match';

export const RemovedTag = React.memo(({ match: { removed, removedAt } }: { match: Match }) => {
  const format = useSelector(getTagDateTimeFormat);
  const timezone = useSelector(getTimezone);

  const removedAtFormatted = React.useMemo(() => removedAt && removedAt.clone().tz(timezone).format(format), [
    format,
    removedAt,
    timezone,
  ]);

  if (!removed) {
    return null;
  }

  return (
    <Tag intent={Intent.DANGER} className={`${Classes.LARGE}`} title={removedAtFormatted || undefined}>
      <WarningSignIcon /> REMOVED
    </Tag>
  );
});
