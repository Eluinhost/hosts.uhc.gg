import { Button, Intent, NonIdealState, Pre, Spinner } from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import { FetchApiKey, RegenerateApiKey } from '../../actions';
import { useResetStorage } from '../../atoms/useResetStorage';
import type { ApplicationState } from '../../state/ApplicationState';

const stateSelector = createSelector(
  (state: ApplicationState) => state.apiKey,
  apiKey => ({ apiKey }),
);

export const ProfilePage: React.FC = () => {
  const {
    apiKey: { fetching, error, key },
  } = useSelector(stateSelector);
  const dispatch = useDispatch();
  const resetStorage = useResetStorage();

  const refreshApiKey = useCallback(() => dispatch(FetchApiKey.start()), [dispatch]);
  const regenerateApiKey = useCallback(() => dispatch(RegenerateApiKey.start()), [dispatch]);

  useEffect(() => {
    refreshApiKey();
  }, [refreshApiKey]);

  if (fetching) {
    return <NonIdealState icon={<Spinner />} title="Loading..." />;
  }

  if (error) {
    return (
      <NonIdealState
        icon={<WarningSignIcon />}
        title="Error"
        action={<Button onClick={refreshApiKey}>Click here to reload</Button>}
      />
    );
  }

  return (
    <div>
      <title>uhc.gg | Profile</title>
      <Button onClick={refreshApiKey}>Refresh</Button>
      <Button onClick={regenerateApiKey}>Regenerate</Button>
      <Pre>
        <span>CURRENT KEY: </span>
        <span>{key || 'NO API KEY GENERATED YET'}</span>
      </Pre>
      <Button intent={Intent.DANGER} onClick={resetStorage}>
        Reset All Data
      </Button>
    </div>
  );
};
