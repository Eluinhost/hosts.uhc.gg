import { Classes, H5 } from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';

import { timeFormatAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';
import type { Match } from '../../models/Match';

export const RemovedInfo: React.FC<{ match: Match }> = ({
  match: { removed, removedAt, removedBy, removedReason },
}) => {
  const format = useAtomValue(timeFormatAtom);
  const timezone = useAtomValue(timezoneAtom);

  const removedAtFormatted = useMemo(
    () => removedAt && removedAt.tz(timezone).format(format),
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
