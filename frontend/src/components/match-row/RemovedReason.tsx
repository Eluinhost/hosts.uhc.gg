import * as React from 'react';
import { useSelector } from 'react-redux';

import { getTagDateTimeFormat, getTimezone } from '../../state/Selectors';
import { Match } from '../../models/Match';

export const RemovedReason = React.memo(({ match: { removedBy, removedAt, removedReason } }: { match: Match }) => {
  const format = useSelector(getTagDateTimeFormat);
  const timezone = useSelector(getTimezone);

  const removedAtFormatted = React.useMemo(() => removedAt && removedAt.clone().tz(timezone).format(format), [format, removedAt, timezone]);

  return (
    <div className="removed-reason">
      <div className="removed-reason-reason">Removed: {removedReason}</div>
      <div className="removed-reason-remover">
        /u/{removedBy}
        {removedAtFormatted && ` @ ${removedAtFormatted}`}
      </div>
    </div>
  );
});
