import { Intent, Tag } from '@blueprintjs/core';
import { useAtomValue } from 'jotai';
import React from 'react';

import { tagDateTimeFormatAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';
import type { Dayjs } from '../../dayjs';

type Props = {
  readonly opens: Dayjs;
  readonly created: Dayjs;
};

export const MatchOpensTag: React.FC<Props> = ({ opens, created }) => {
  const timezone = useAtomValue(timezoneAtom);
  const format = useAtomValue(tagDateTimeFormatAtom);

  return (
    <Tag
      intent={Intent.SUCCESS}
      size="large"
      className="match-opens"
      title={`Created @ ${created.tz(timezone).format(format)}`}
    >
      {opens.tz(timezone).format(format)}
    </Tag>
  );
};
