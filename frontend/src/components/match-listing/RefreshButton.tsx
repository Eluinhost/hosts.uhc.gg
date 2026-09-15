import { Classes, Intent, Button } from '@blueprintjs/core';
import { RefreshIcon } from '@blueprintjs/icons';
import moment from 'moment-timezone';
import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { getTimeFormat, getTimezone } from '../../state/Selectors';

type OwnProps = {
  readonly lastUpdated: moment.Moment | null;
  readonly onClick: () => void;
  readonly loading: boolean;
};

const stateSelector = createSelector(getTimeFormat, getTimezone, (format, timezone) => ({
  format,
  timezone,
}));

export const RefreshButton: React.FC<OwnProps> = ({ lastUpdated, onClick, loading }) => {
  const { format, timezone } = useSelector(stateSelector);

  const buttonContent = loading
    ? 'Refreshing...'
    : lastUpdated
      ? `Refreshed @ ${lastUpdated.clone().tz(timezone).format(format)}`
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
