import { Alert } from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';

import { timeFormatAtom } from '@/atoms/timeFormatting';
import { timezoneAtom } from '@/atoms/timezone';
import type { Match } from '@/models/Match';

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
    <Alert flex={1} color="red" title="This game is no longer on the calendar" icon={<WarningIcon />}>
      {removedReason} - /u/{removedBy} {removedAtFormatted && `@ ${removedAtFormatted}`}
    </Alert>
  );
};
