import { Button, Intent, NonIdealState, Pre, Spinner } from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { ApiKeysData } from '../../apiKeys/api';
import { useResetStorage } from '../../atoms/useResetStorage';

export const ProfilePage: React.FC = () => {
  const resetStorage = useResetStorage();
  const { data: apiKey, error, isFetching, refetch: refreshApiKey } = useQuery(ApiKeysData.apiKey);
  const { mutate: regenerateApiKey, isPending: isRegenerating } = ApiKeysData.mutations.useRegenerateApiKey();

  if (isFetching || isRegenerating) {
    return <NonIdealState icon={<Spinner />} title="Loading..." />;
  }

  if (error) {
    return (
      <NonIdealState
        icon={<WarningSignIcon />}
        title="Error"
        action={
          <Button
            onClick={() => {
              void refreshApiKey();
            }}
          >
            Click here to reload
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <title>uhc.gg | Profile</title>
      <Button
        onClick={() => {
          void refreshApiKey();
        }}
      >
        Refresh
      </Button>
      <Button
        onClick={() => {
          regenerateApiKey();
        }}
      >
        {apiKey?.key ? 'Regenerate' : 'Generate'}
      </Button>
      <Pre>
        <span>CURRENT KEY: </span>
        <span>{apiKey?.key || 'NO API KEY GENERATED YET'}</span>
      </Pre>
      <Button
        intent={Intent.DANGER}
        onClick={resetStorage}
        title="Resets all browser data, does not include matches/api keys"
      >
        Reset All Browser Data
      </Button>
    </div>
  );
};
