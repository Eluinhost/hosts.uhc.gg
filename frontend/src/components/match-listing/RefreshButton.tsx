import React from 'react';
import moment from 'moment-timezone';
import { Classes, Icon, Intent, Button } from '@blueprintjs/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import * as Selectors from '../../state/Selectors';

type OwnProps = {
  readonly lastUpdated: moment.Moment | null;
  readonly onClick: () => void;
  readonly loading: boolean;
};

type StateSlice = {
  readonly format: string;
  readonly timezone: string;
};

const stateSelector = createSelector<ApplicationState, string, string, StateSlice>(
  Selectors.getTimeFormat,
  Selectors.getTimezone,
  (format, timezone) => ({ format, timezone }),
);

export const RefreshButton: React.FC<OwnProps> = React.memo(({ lastUpdated, onClick, loading }) => {
  const { format, timezone } = useSelector(stateSelector);

  const buttonContent = loading
    ? 'Refreshing...'
    : lastUpdated
    ? `Refreshed @ ${lastUpdated.clone().tz(timezone).format(format)}`
    : `Refresh`;

  return (
    <Button
      intent={Intent.SUCCESS}
      minimal
      large
      onClick={onClick}
      disabled={loading}
      icon={<Icon icon="refresh" className={loading ? Classes.SPINNER_ANIMATION : ''} />}
      text={buttonContent}
    />
  );
});
