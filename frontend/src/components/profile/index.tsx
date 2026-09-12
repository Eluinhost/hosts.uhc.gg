import React, { useCallback, useEffect } from 'react';
import { ApplicationState } from '../../state/ApplicationState';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Intent, NonIdealState, Pre, Spinner } from '@blueprintjs/core';
import { Title } from '../Title';
import { createSelector } from 'reselect';
import { ClearStorage, FetchApiKey, RegenerateApiKey } from '../../actions';

const stateSelector = createSelector(
  (state: ApplicationState) => state.apiKey,
  apiKey => ({ apiKey }),
);

export const ProfilePage = React.memo(() => {
  const {
    apiKey: { fetching, error, key },
  } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const refreshApiKey = useCallback(() => dispatch(FetchApiKey.start()), [dispatch]);
  const regenerateApiKey = useCallback(() => dispatch(RegenerateApiKey.start()), [dispatch]);
  const resetStorage = useCallback(() => dispatch(ClearStorage.start()), [dispatch]);

  useEffect(() => {
    refreshApiKey();
  }, [refreshApiKey]);

  if (fetching) {
    return <NonIdealState icon={<Spinner />} title="Loading..." />;
  }

  if (error) {
    return (
      <NonIdealState
        icon="warning-sign"
        title="Error"
        action={<Button onClick={refreshApiKey}>Click here to reload</Button>}
      />
    );
  }

  return (
    <div>
      <Title>Profile</Title>
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
});
