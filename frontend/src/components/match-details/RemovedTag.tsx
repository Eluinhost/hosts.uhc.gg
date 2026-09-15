import { Classes, Intent, Tag } from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { Match } from '../../models/Match';
import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';

export const RemovedTag: React.FC<{ match: Match }> = ({ match: { removed, removedAt } }) => {
  const format = useSelector(getTagDateTimeFormat);
  const timezone = useSelector(getTimezone);

  const removedAtFormatted = useMemo(
    () => removedAt && removedAt.clone().tz(timezone).format(format),
    [format, removedAt, timezone],
  );

  if (!removed) {
    return null;
  }

  return (
    <Tag intent={Intent.DANGER} className={Classes.LARGE} title={removedAtFormatted || undefined}>
      <WarningSignIcon /> REMOVED
    </Tag>
  );
};
