import { atom, useAtomValue } from 'jotai';
import React from 'react';

import { timeFormatAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';
import type { Dayjs } from '../../dayjs';

const detailsDateTimeFormatAtom = atom(get => `MMM Do YYYY - ${get(timeFormatAtom)} z`);

export const MatchOpens: React.FC<{ time: Dayjs }> = ({ time }) => {
  const timezone = useAtomValue(timezoneAtom);
  const format = useAtomValue(detailsDateTimeFormatAtom);

  return <span className="match-time">{time.tz(timezone).format(format)}</span>;
};
