import { Alert, Text } from '@mantine/core';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';

import { tagDateTimeFormatAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';
import type { Match } from '../../models/Match';

export const RemovedReason: React.FC<{ match: Match }> = ({ match: { removedBy, removedAt, removedReason } }) => {
  const format = useAtomValue(tagDateTimeFormatAtom);
  const timezone = useAtomValue(timezoneAtom);

  const removedAtFormatted = useMemo(
    () => removedAt && removedAt.tz(timezone).format(format),
    [format, removedAt, timezone],
  );

  return (
    <Alert color="red" mt="xs">
      <Text fw={700}>Removed: {removedReason}</Text>
      <Text>
        /u/{removedBy} {removedAtFormatted && ` @ ${removedAtFormatted}`}
      </Text>
    </Alert>
  );
};
