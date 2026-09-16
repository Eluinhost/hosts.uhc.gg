import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { Match } from '../../models/Match';
import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';

export const RemovedReason: React.FC<{ match: Match }> = ({ match: { removedBy, removedAt, removedReason } }) => {
  const format = useSelector(getTagDateTimeFormat);
  const timezone = useSelector(getTimezone);

  const removedAtFormatted = useMemo(
    () => removedAt && removedAt.tz(timezone).format(format),
    [format, removedAt, timezone],
  );

  return (
    <div className="removed-reason">
      <div className="removed-reason-reason">Removed: {removedReason}</div>
      <div className="removed-reason-remover">
        /u/{removedBy}
        {removedAtFormatted && ` @ ${removedAtFormatted}`}
      </div>
    </div>
  );
};
