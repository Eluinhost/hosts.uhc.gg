import { Classes, Intent, Button } from '@blueprintjs/core';
import { RefreshIcon } from '@blueprintjs/icons';
import { useAtomValue } from 'jotai';
import React from 'react';

import { timeFormatAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';
import type { Dayjs } from '../../dayjs';

type OwnProps = {
  readonly lastUpdated: Dayjs | null;
  readonly onClick: () => void;
  readonly loading: boolean;
};

export const RefreshButton: React.FC<OwnProps> = ({ lastUpdated, onClick, loading }) => {
  const timezone = useAtomValue(timezoneAtom);
  const format = useAtomValue(timeFormatAtom);

  const buttonContent = loading
    ? 'Refreshing...'
    : lastUpdated
      ? `Refreshed @ ${lastUpdated.tz(timezone).format(format)}`
      : `Refresh`;

  return (
    <Button
      intent={Intent.SUCCESS}
      variant="minimal"
      size="large"
      onClick={onClick}
      disabled={loading}
      icon={<RefreshIcon className={loading ? Classes.SPINNER_ANIMATION : ''} />}
      text={buttonContent}
    />
  );
};
