import { Classes, Icon, Intent, Tag } from '@blueprintjs/core';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';
import { Match } from '../../models/Match';

export const RemovedTag = React.memo(({ match: { removed, removedAt } }: { match: Match }) => {
  const format = useSelector(getTagDateTimeFormat);
  const timezone = useSelector(getTimezone);

  const removedAtFormatted = React.useMemo(() => removedAt && removedAt.clone().tz(timezone).format(format), [
    format,
    timezone,
  ]);

  if (!removed) {
    return null;
  }

  return (
    <Tag intent={Intent.DANGER} className={`${Classes.LARGE}`} title={removedAtFormatted || undefined}>
      <Icon icon="warning-sign" /> REMOVED
    </Tag>
  );
});
