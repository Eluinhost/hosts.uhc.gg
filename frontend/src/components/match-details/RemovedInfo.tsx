import { Classes, H5 } from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import React from 'react';
import { useSelector } from 'react-redux';

import { Match } from '../../models/Match';
import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';

export const RemovedInfo: React.FC<{ match: Match }> = ({
  match: { removed, removedAt, removedBy, removedReason },
}) => {
  const format = useSelector(getTagDateTimeFormat);
  const timezone = useSelector(getTimezone);

  const removedAtFormatted = React.useMemo(
    () => removedAt && removedAt.clone().tz(timezone).format(format),
    [format, removedAt, timezone],
  );

  if (!removed) {
    return null;
  }

  return (
    <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
      <H5>
        <WarningSignIcon /> REMOVED
      </H5>
      <p>This game is no longer on the calendar:</p>
      <p>
        {removedReason} - /u/{removedBy} {removedAtFormatted && `@ ${removedAtFormatted}`}
      </p>
    </div>
  );
};
