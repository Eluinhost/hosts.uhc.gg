import { Badge } from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';

import { tagDateTimeFormatAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';
import type { Match } from '../../models/Match';

export const RemovedTag: React.FC<{ match: Match }> = ({ match: { removed, removedAt } }) => {
  const format = useAtomValue(tagDateTimeFormatAtom);
  const timezone = useAtomValue(timezoneAtom);

  const removedAtFormatted = useMemo(
    () => removedAt && removedAt.tz(timezone).format(format),
    [format, removedAt, timezone],
  );

  if (!removed) {
    return null;
  }

  return (
    <Badge bdrs="sm" color="red" size="lg" title={removedAtFormatted || undefined} leftSection={<WarningIcon />}>
      REMOVED
    </Badge>
  );
};
