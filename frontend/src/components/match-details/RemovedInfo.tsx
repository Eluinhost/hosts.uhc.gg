import { Classes, H5, Icon } from '@blueprintjs/core';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';
import { Match } from '../../models/Match';

export const RemovedInfo = React.memo(
  ({ match: { removed, removedAt, removedBy, removedReason } }: { match: Match }) => {
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
      <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
        <H5>
          <Icon icon="warning-sign" /> REMOVED
        </H5>
        <p>This game is no longer on the calendar:</p>
        <p>
          {removedReason} - /u/{removedBy} {removedAtFormatted && `@ ${removedAtFormatted}`}
        </p>
      </div>
    );
  },
);
